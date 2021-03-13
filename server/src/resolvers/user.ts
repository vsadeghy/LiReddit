import argon2 from "argon2";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { getConnection } from "typeorm";
import { v4 } from "uuid";
import { COOKIE_NAME } from "../constants";
import { User } from "../entities/User";
import { MyContext } from "../types";
import { emailRegex } from "../utils/emailRegex";
import { sendEmail } from "../utils/sendEmail";
import { validateRegister } from "../utils/validateRegister";
import { FORGET_PASSWORD_PREFIX } from "./../constants";
import { validatePassword } from "./../utils/validateRegister";

@InputType()
class UserInput {
  @Field()
  username: string;
  @Field()
  password: string;
  @Field()
  email: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class userResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    if (req.session.userId === user.id) {
      return user.email;
    }
    return "";
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    // not logged in
    if (!req.session.userId) {
      return null;
    }
    console.log("userId: ", req.session.userId);

    return User.findOne(req.session.userId);
  }

  @Query(() => [User])
  users(): Promise<User[]> {
    return User.find();
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UserInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    let errors = validateRegister(options);
    if (errors.length) return { errors };
    const hashedPassword = await argon2.hash(options.password);

    let user;

    // user = em.create(User, {
    //   username: options.username,
    //   password: hashedPassword,
    //   email:options.email
    // });
    try {
      // await em.persistAndFlush(user);

      // manual sql query
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          password: hashedPassword,
          email: options.email,
        })
        .returning("*")
        .execute();

      user = result.raw[0];
    } catch (err) {
      console.log("err: ", err);

      if (err.code === "23505") {
        //duplicate error
        const field: string = err.detail.match(/\(([^\)]+)\)/)[1];
        return {
          errors: [
            {
              field,
              message: `${field} already taken`,
            },
          ],
        };
      }
    }

    // store user id session
    // sets cookie on the user on register
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.match(emailRegex)
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );
    if (!user) {
      console.log("no user found");

      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "user doesn't exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "password is incorrect",
          },
        ],
      };
    }
    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) => {
      res.clearCookie(COOKIE_NAME);
      req.session.destroy((err) => {
        if (err) {
          console.error(err);
          resolve(false);
          return;
        }

        resolve(true);
      });
    });
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Ctx() { redis }: MyContext,
    @Arg("email") email: string
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return true;
    }
    const token = v4();
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 2 // 2 minutes
    );
    sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}"> reset password</a>`
    );
    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    let passwordError = validatePassword(newPassword, "newPassword", false);
    if (passwordError.length) return { errors: passwordError };

    const key = FORGET_PASSWORD_PREFIX + token;
    let userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };
    }

    const userIdNum = parseInt(userId);
    const user = await User.findOne(userIdNum);
    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }

    await User.update(
      { id: userIdNum },
      {
        password: await argon2.hash(newPassword),
      }
    );

    await redis.del(key);

    req.session.userId = user.id;

    return { user };
  }
}

import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Post } from "../entities/Post";
import { Updoot } from "./../entities/Updoot";
import { isAuth } from "./../middleware/isAuth";
import { MyContext } from "./../types";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() post: Post) {
    return post.text.slice(0, 50);
  }

  // User relations
  @FieldResolver(() => String)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    // return  User.findOne(post.creatorId);
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { updootLoader, req }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }
    const updoot = await updootLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });

    return updoot ? updoot.value : null;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any = [realLimitPlusOne];

    // if (req.session.userId) {
    //   replacements.push(req.session.userId);
    // }

    // let cursorIdx = 3;
    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
      // cursorIdx = replacements.length;
    }

    // const withUser = false;
    const userQuery: string[] = [];
    // const withVoteStatus = false;
    userQuery.push(``);

    const postsQuery = `
    select p.*${
      /* ,

      json_build_object(
      'id', u.id,
      'username', u.username,
      'email', u.email,
      'createdAt', u."createdAt",
      'updatedAt', u."updatedAt"
    ) creator,

    ${
      withVoteStatus && req.session.userId
        ? '(select value from updoot where "userId" = $2 and "postId" = p.id) "voteStatus"'
        : 'null as "voteStatus"'
    */ ""
    }
    from post p
    ${/* inner join public.user u on u.id = p."creatorId" */ ""}
    ${cursor ? `where p."createdAt" < $${/* cursorIdx */ 2}` : ""}
    order by p."createdAt" DESC
    limit $1
    `;
    const posts = await getConnection().query(postsQuery, replacements);

    // const qb = getConnection()
    //   .getRepository(Post)
    //   .createQueryBuilder("p")
    //   .innerJoinAndSelect("p.creator", "u", 'u.id = p."creatorId"')
    //   .orderBy('p."createdAt"', "DESC")
    //   .take(realLimitPlusOne);
    // const posts = await qb.getMany();

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id /* , { relations: ["creator"] } */);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("options") options: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return await Post.create({
      ...options,
      creatorId: parseInt(req.session.userId),
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    return (
      await getConnection()
        .createQueryBuilder()
        .update(Post)
        .set({ title, text })
        .where('id = :id AND "creatorId" = :creatorId', {
          id,
          creatorId: req.session.userId,
        })
        .returning("*")
        .execute()
    ).raw[0];
  }

  @Mutation(() => Boolean, { nullable: true })
  async updatePostManual(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title?: string,
    @Arg("text", () => String, { nullable: true }) text?: string,
    @Arg("points", () => Int, { nullable: true }) points?: number
  ) {
    const post = await Post.findOne(id);
    if (post) {
      if (title) {
        post.title = title;
      }
      if (text) {
        post.text = text;
      }
      if (typeof points === "number") {
        post.points = points;
      }
      Post.save(post);
    }
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    // not cascade
    // const post = await Post.findOne(id);
    // if (!post) {
    //   return false;
    // }
    // if (post.creator.id !== req.session.userId) {
    // }
    // await Updoot.delete({ postId: id });
    // await Post.delete({ id });

    //cascade
    await Post.delete({ id, creatorId: req.session.userId });
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const { userId } = req.session;

    const updoot = await Updoot.findOne({ where: { userId, postId } });

    let realValue = Math.sign(value);
    if (updoot) {
      if (realValue == updoot.value) {
        realValue *= -1;
      } else {
        realValue *= 2;
      }
      await Updoot.remove(updoot);
    } else {
      await Updoot.insert({
        userId,
        postId,
        value: Math.sign(realValue),
      });
    }

    await getConnection().query(
      `
      update post
      set points = points + $1
      where id = $2
    `,
      [realValue, postId]
    );

    return true;
  }
}

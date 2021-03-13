import { Arg, Field, ObjectType, Query, Resolver } from "type-graphql";
import { Post } from "../entities/Post";
import { User } from "../entities/User";
import { Updoot } from "./../entities/Updoot";

@ObjectType()
class UserVote {
  @Field()
  userId: number;
  @Field()
  vote: number;
}

@ObjectType()
class PostUpdoot {
  @Field(() => [UserVote])
  userVotes: UserVote[];
  @Field()
  total: number;
}

@Resolver(Updoot)
export class UpdootResolver {
  @Query(() => Updoot, { nullable: true })
  async updoot(@Arg("userId") userId: number, @Arg("postId") postId: number) {
    return Updoot.findOne({ where: { userId, postId } });
  }

  @Query(() => PostUpdoot, { nullable: true })
  async postUpdoots(@Arg("postId") postId: number) {
    console.log("here");

    let post = await Post.findOne(postId);
    if (!post) {
      console.log("post not found");
      return null;
    }

    const updoots = await Updoot.find({ where: { postId } });
    if (!updoots) {
      console.log("updoot not found");
      return null;
    }
    let userVotes: UserVote[] = [];
    let total = 0;
    let i = 0;

    updoots.forEach((ud) => {
      console.log(i++);

      userVotes.push({ userId: ud.userId, vote: ud.value });
      total += ud.value;
    });
    return { userVotes, total };
  }

  @Query(() => PostUpdoot, { nullable: true })
  async userUpdoots(@Arg("userId") userId: number) {
    console.log("here");

    let user = await User.findOne(userId);
    if (!user) {
      console.log("user not found");
      return null;
    }

    const updoots = await Updoot.find({ where: { userId } });
    if (!updoots) {
      console.log("no updoots found");
      return null;
    }
    let userVotes: UserVote[] = [];
    let total = 0;
    let i = 0;

    updoots.forEach((ud) => {
      console.log(i++);

      userVotes.push({ userId: ud.userId, vote: ud.value });
      total += ud.value;
    });
    return { userVotes, total };
  }
}

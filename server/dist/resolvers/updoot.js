"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdootResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Post_1 = require("../entities/Post");
const User_1 = require("../entities/User");
const Updoot_1 = require("./../entities/Updoot");
let UserVote = class UserVote {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], UserVote.prototype, "userId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], UserVote.prototype, "vote", void 0);
UserVote = __decorate([
    type_graphql_1.ObjectType()
], UserVote);
let PostUpdoot = class PostUpdoot {
};
__decorate([
    type_graphql_1.Field(() => [UserVote]),
    __metadata("design:type", Array)
], PostUpdoot.prototype, "userVotes", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], PostUpdoot.prototype, "total", void 0);
PostUpdoot = __decorate([
    type_graphql_1.ObjectType()
], PostUpdoot);
let UpdootResolver = class UpdootResolver {
    updoot(userId, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            return Updoot_1.Updoot.findOne({ where: { userId, postId } });
        });
    }
    postUpdoots(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("here");
            let post = yield Post_1.Post.findOne(postId);
            if (!post) {
                console.log("post not found");
                return null;
            }
            const updoots = yield Updoot_1.Updoot.find({ where: { postId } });
            if (!updoots) {
                console.log("updoot not found");
                return null;
            }
            let userVotes = [];
            let total = 0;
            let i = 0;
            updoots.forEach((ud) => {
                console.log(i++);
                userVotes.push({ userId: ud.userId, vote: ud.value });
                total += ud.value;
            });
            return { userVotes, total };
        });
    }
    userUpdoots(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("here");
            let user = yield User_1.User.findOne(userId);
            if (!user) {
                console.log("user not found");
                return null;
            }
            const updoots = yield Updoot_1.Updoot.find({ where: { userId } });
            if (!updoots) {
                console.log("no updoots found");
                return null;
            }
            let userVotes = [];
            let total = 0;
            let i = 0;
            updoots.forEach((ud) => {
                console.log(i++);
                userVotes.push({ userId: ud.userId, vote: ud.value });
                total += ud.value;
            });
            return { userVotes, total };
        });
    }
};
__decorate([
    type_graphql_1.Query(() => Updoot_1.Updoot, { nullable: true }),
    __param(0, type_graphql_1.Arg("userId")), __param(1, type_graphql_1.Arg("postId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], UpdootResolver.prototype, "updoot", null);
__decorate([
    type_graphql_1.Query(() => PostUpdoot, { nullable: true }),
    __param(0, type_graphql_1.Arg("postId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UpdootResolver.prototype, "postUpdoots", null);
__decorate([
    type_graphql_1.Query(() => PostUpdoot, { nullable: true }),
    __param(0, type_graphql_1.Arg("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UpdootResolver.prototype, "userUpdoots", null);
UpdootResolver = __decorate([
    type_graphql_1.Resolver(Updoot_1.Updoot)
], UpdootResolver);
exports.UpdootResolver = UpdootResolver;
//# sourceMappingURL=updoot.js.map
import { mergeResolvers } from "@graphql-tools/merge"
import Users from "../../schemas/students.model"
import UserResolver from "./users.resolver"
import PostsResolvers from "./posts.resolver"
import StringOrIntScalarType from "../scalars/types.scalar"
import Posts from "../../schemas/notes.model"
import { getComment } from "../../services/feedback.service"

const RootQueryResolver = {
    StringOrInt: StringOrIntScalarType,
    
    Query: {
        async user(_, args: { username: string }) {
            const user = await Users.findOne({ username: args.username })
            return user
        },

        async post(_, args: { postID: string }) {
            const post = await Posts.findOne({ postID: args.postID })
            return post
        },

        async posts(_, args: { page: number, seed: number }) {
            try {
                const limit = 7
                const skip: number = (args.page - 1) * limit
                //FIXME: need the shuffle
                const posts = await Posts.find({}).skip(skip).limit(limit)
                return posts
            } catch (error) {
                return null
            }
        },

        async comments(_, args: { postID: string }) {
            try {
                const response = await getComment(args.postID)
                return response.comments
            } catch (error) {
                console.error(error)
                return null
            }
        }
    }
}

export default mergeResolvers([RootQueryResolver, UserResolver, PostsResolvers])
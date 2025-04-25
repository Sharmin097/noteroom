import { mergeResolvers } from "@graphql-tools/merge"
import Users from "../../schemas/students.model"
import UserResolver from "./users.resolver"
import PostsResolvers from "./posts.resolver"
import StringOrIntScalarType from "../scalars/types.scalar"

const RootQueryResolver = {
    StringOrInt: StringOrIntScalarType,
    
    Query: {
        async user(_, args: { username: string }) {
            const user = await Users.findOne({ username: args.username })
            return user
        }
    }
}

export default mergeResolvers([RootQueryResolver, UserResolver, PostsResolvers])
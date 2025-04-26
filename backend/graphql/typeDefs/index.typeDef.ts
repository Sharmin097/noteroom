import { mergeTypeDefs } from "@graphql-tools/merge"
import UserTypeDefs from "./users.typeDef"
import PostTypeDefs from "./posts.typeDef"

const RootQuery = `#graphql
    scalar StringOrInt
    
    type Query {
        user(username: String!): User
        post(postID: String!): Post
        posts(page: Int!, seed: Int!): [Post]
    }
`

export default mergeTypeDefs([ RootQuery, UserTypeDefs, PostTypeDefs ])
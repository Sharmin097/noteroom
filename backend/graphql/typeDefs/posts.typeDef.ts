const PostTypeDefs = `#graphql
    type Content {
        resources: [String]
        returnedContentCount: Int
        totalContentCount: Int
    }

    type Post {
        postID: String!
        title: String!
        content(startIndex: Int, count: Int): Content
    }
`

export default PostTypeDefs
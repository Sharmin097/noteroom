const PostTypeDefs = `#graphql
    type Content {
        resources: [String]
        returnedContentCount: Int
        totalContentCount: Int
    }

    type InteractionData {
        feedbackCount: Int
        upvoteCount: Int
        isSaved: Boolean
        isUpvoted: Boolean
    }

    type Post {
        postID: String!
        title: String!
        description: String
        createdAt: String
        isPostOwner: Boolean!
        content(startIndex: Int, count: Int): Content
        owner: User
        interactionData: InteractionData
        ownerUserName: String!
    }

    type Comment {
        _id: String!
        feedbackContents: String!
        commenter: User!
        replyCount: Int!
        upvoteCount: Int!
        createdAt: String!
        replies: [Reply]
    }

    type Reply {
        _id: String
        replier: User
        feedbackContents: String
        createdAt: String
        parentFeedbackDocID: String
    }

    type Mutation {
        postComment(postID: String!, feedbackContent: String!): Comment
        postReply(postID: String!, feedbackContent: String!, parentFeedbackDocID: String): Reply
    }
`

export default PostTypeDefs

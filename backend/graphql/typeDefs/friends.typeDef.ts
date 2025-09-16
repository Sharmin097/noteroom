const FriendTypeDefs = `#graphql
    enum FriendRequestStatus { follower, following } 

    type FriendRequest {
        requestID: String!
        other: User!
    }
`

export default FriendTypeDefs

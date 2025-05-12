const FriendTypeDefs = `#graphql
    enum FriendRequestStatus { follower, following } 

    type FriendRequest {
        requestID: String!
        sender: User!
    }
`

export default FriendTypeDefs

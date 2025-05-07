const FriendTypeDefs = `#graphql
    enum FriendRequestStatus { pending, accepted, declined } 

    type FriendRequest {
        requestID: String!
        sender: User!
        status: String!
    }
`

export default FriendTypeDefs

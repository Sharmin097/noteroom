import { gql } from "@apollo/client"

const getFriendRequestsByReceiverAndStatus = gql`
    query GetFriendRequests($receiverDocID: String!, $status: String!) {
        friendRequests(receiverDocID: $receiverDocID, status: $status) {
            requestID
            senderDocID
            receiverDocID
            status
        }
    }
`

export { getFriendRequestsByReceiverAndStatus }

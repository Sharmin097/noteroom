import { gql } from "@apollo/client"


const getPostByPostID = gql`
    query GetPost($postID: String!) {
        post(postID: $postID) {
            postID
            title
            description
            createdAt
            isPostOwner
            content(startIndex: 0) {
                resources
                totalContentCount
            }
            owner {
                profile_pic
                displayname
                username
            }
            interactionData {
                feedbackCount
                upvoteCount
                isSaved
                isUpvoted
            }
        }
    }
`


const getPostsByPage = gql`
    query GetPostBypage($page: Int!, $seed: Int!) {
        posts(page: $page, seed: $seed) {
            postID
            title
            description
            createdAt
            isPostOwner
            content(startIndex: 0) {
                resources
                totalContentCount
            }
            owner {
                profile_pic
                displayname
                username
            }
            interactionData {
                feedbackCount
                upvoteCount
                isSaved
                isUpvoted
            }
        }
    }
`

const getPostContentsByPostID = gql`
    query GetPostContentsByPostID($postID: String!) {
        post(postID: $postID) {
            content(startIndex: 0) {
                resources
                totalContentCount
            }
        }
    }
`

export { getPostByPostID, getPostsByPage, getPostContentsByPostID }
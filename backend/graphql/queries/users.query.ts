import { gql } from "@apollo/client"


const getUserByUsername = gql`
    query GetUser($username: String!) {
        user(username: $username) {
            profile_pic
            displayname
            rollnumber
            collegeyear
            bio
            favouritesubject
            notfavsubject
            group
            username
            collegeID
            featuredNoteCount
            owner
            badges {
                badgeID
                badgeLogo
                badgeText
            }
            owned_posts {
                postID
                title
                content(startIndex: 0, count: 1) {
                    resources
                }
            }
        }
    }
`

const getSavedPostsByUsername = gql`
    query GetSavedPosts($username: String!) {
        user(username: $username) {
            saved_posts {
                postID
                title
                content(startIndex: 0, count: 1) {
                    resources
                }
            }
        }
    }
`

export {getUserByUsername, getSavedPostsByUsername}
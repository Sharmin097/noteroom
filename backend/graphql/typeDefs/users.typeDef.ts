const UserTypeDefs = `#graphql
    type Badge {
        badgeID: Int!
        badgeLogo: String!
        badgeText: String!
    }

    type User {
        profile_pic: String
        displayname: String
        rollnumber: String
        collegeyear: String
        bio: String
        favouritesubject: String
        notfavsubject: String
        group: String
        collegeID: StringOrInt
        username: String!
        owner: Boolean
        featuredNoteCount: Int
        badges: [Badge]
        owned_posts: [Post]
        saved_posts: [Post]
    }
`

export default UserTypeDefs
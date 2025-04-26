import Users from "../../schemas/students.model"
import Posts from "../../schemas/notes.model"
import Badges from "../../schemas/badges.model"
import { Convert } from "../../services/user.service"

const UserResolver = {
    User: {
        async owned_posts(parent) {
            try {
                const postDocIDs = (await Users.findOne({ username: parent.username }, { owned_notes: 1 }))["owned_notes"]
                if (postDocIDs.length !== 0) {
                    const posts = await Posts.find({ _id: { $in: postDocIDs } })
                    return posts
                } else {
                    return []
                }
            } catch (error) {
                return []
            }
        },
        async saved_posts(parent) {
            try {
                const postDocIDs = (await Users.findOne({ username: parent.username }, { saved_notes: 1 }))["saved_notes"]
                if (postDocIDs.length !== 0) {
                    const posts = await Posts.find({ _id: { $in: postDocIDs } })
                    return posts
                } else {
                    return []
                }
            } catch (error) {
                return []
            }
        },

        async badges(parent) {
            try {
                const badgeID = (await Users.findOne({ username: parent.username }, { badges: 1 })).badges
                const badges = await Badges.find({ badgeID: badgeID[0] })
                return badges
            } catch (error) {
                return []
            }
        },

        async owner(parent, __, context) {
            const { req, res } = context
            const userID = req.session["stdid"]
            const username = (await Convert.getUserName_studentid(userID)).toString()
            return parent.username === username
        },

        async featuredNoteCount() {
            return 0
        }
    }
}

export default UserResolver
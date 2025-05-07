import { mergeResolvers } from "@graphql-tools/merge"
import Users from "../../schemas/students.model"
import UserResolver from "./users.resolver"
import PostsResolvers from "./posts.resolver"
import StringOrIntScalarType from "../scalars/types.scalar"
import Posts from "../../schemas/notes.model"
import { getComments } from "../../services/feedback.service"
import { getNotifications } from "../../services/notification.service"
import { Convert } from "../../services/user.service"
import { getFriendRequests } from '../../services/friends.service';

const RootQueryResolver = {
    StringOrInt: StringOrIntScalarType,
    
    Query: {
        async user(_, args: { username: string }) {
            const user = (await Users.findOne({ username: args.username })).toObject()
            return user
        },

        async post(_, args: { postID: string }) {
            const post = await (await Posts.findOne({ postID: args.postID })).toObject()
            return post
        },

        async posts(_, args: { page: number, seed: number }) {
            try {
                const limit = 7
                const skip: number = (args.page - 1) * limit
                //FIXME: need the shuffle
                const posts = await Posts.find({}).skip(skip).limit(limit)
                return posts
            } catch (error) {
                return null
            }
        },

        async comments(_, args: { postID: string }) {
            try {
                const response = await getComments(args.postID)
                if (response.ok) {
                    return response.comments
                }
                return null
            } catch (error) {
                return null
            }
        },

        async notifications(parent,_ , context) {
            try {
                const { req, res } = context
                const ownerStudentID = req.session?.["stdid"]
                const response = await getNotifications(ownerStudentID)
                if (response.ok) {
                    return response.notifications
                }
                return null
            } catch (error) {
                return null
            }
        },

        async friend_requests(_, args: { status: "accepted" | "declined" | "pending" }, context) {
            try {
                const { req, res } = context
                const receiverDocID = (await Convert.getDocumentID_studentid(req.session["stdid"]))?.toString()
                const response = await getFriendRequests(receiverDocID, args.status)
                if (response.ok) {
                    return response.requests
                }
                return null
            } catch (error) {
                return null
            }
        }
    }
}

export default mergeResolvers([RootQueryResolver, UserResolver, PostsResolvers])
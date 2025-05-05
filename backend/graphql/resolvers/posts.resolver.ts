import notesModel from "../../schemas/notes.model"
import Posts, { PostType } from "../../schemas/notes.model"
import Users from "../../schemas/students.model"
import { addFeedback, addReply, getReplies } from "../../services/feedback.service"
import { isSaved } from "../../services/post.service"
import { Convert } from "../../services/user.service"
import { isUpvoted } from "../../services/vote.service"

const PostsResolvers = {
    Post: {
        async content(parent, args: { startIndex: number, count: number | null}) {
            try {
                const postID = parent.postID
                const content = (await Posts.findOne({ postID: postID }, { content: 1 })).toObject()?.["content"]
                if(content && content.length !== 0) {
                    let sliced: string[]
                    if (!args.startIndex && !args.count) {
                        sliced = content
                    } else if (!args.count) {
                        sliced = content.slice(args.startIndex)
                    } else {
                        sliced = content.slice(args.startIndex, args.count)
                    }

                    return { 
                        resources: sliced, 
                        returnedContentCount: sliced.length, 
                        totalContentCount: content.length 
                    }
                } else {
                    return []
                }
            } catch (error) {
                return []
            }
        },
        async owner(parent) {
            try {
                const user = await Users.findOne({ username: parent.ownerUserName })
                return user
            } catch (error) {
                return null
            }
        },

        async isPostOwner(parent, _, context) {
            try {
                const { req, res } = context
                const postOwnerUsername = parent.ownerUserName
                const viewrUserName = await Convert.getUserName_studentid(req.session["stdid"])
                return postOwnerUsername === viewrUserName
            } catch (error) {
                return false
            }
        },

        async interactionData(parent, _, context) {
            try {
                const { req, res }= context
                const post = await Posts.findOne({ postID: parent.postID }, { feedbackCount: 1, upvoteCount: 1 })
                const userDocID = (await Convert.getDocumentID_studentid(req.session["stdid"])).toString()
                const issaved = await isSaved(userDocID, post._id.toString())
                const isupvoted = await isUpvoted(post._id.toString(), userDocID)
                return {...post.toObject(), isSaved: issaved, isUpvoted: isupvoted}
            } catch (error) {
                return null
            }
        }
    },
    Comment: {
        async replies(parent) {
            try {
                const parentFeedbackDocID = parent._id?.toString()
                const response = await getReplies(parentFeedbackDocID)
                if (response.ok) {
                    return response.replies
                }
            } catch (error) {
                return null
            }
        }
    },
    Mutation: {
        //TODO: trigger notification when commented or replied to relevant user
        async postComment(_, args: { postID: string, feedbackContent: string }, context) {
            try {
                const { req, res } = context
                const postDocID = (await notesModel.findOne({ postID: args.postID }, { _id: 1 }))._id
                const commenterDocID = (await Convert.getDocumentID_studentid(req.session["stdid"])).toString()
                const feedbackData = {
                    noteDocID: postDocID,
                    feedbackContents: args.feedbackContent,
                    commenterDocID: commenterDocID
                }
                const response = await addFeedback(feedbackData)
                if (response.ok) {
                    return response.feedback
                }
                return null
            } catch (error) {
                return null
            }
        },

        async postReply(_, args: { postID: string, feedbackContent: string, parentFeedbackDocID: string}, context ) {
            try {
                const { req, res } = context
                const postDocID = (await notesModel.findOne({ postID: args.postID }, { _id: 1 }))._id
                const commenterDocID = (await Convert.getDocumentID_studentid(req.session["stdid"])).toString()

                const replyData = {
                    noteDocID: postDocID,
                    feedbackContents: args.feedbackContent,
                    commenterDocID: commenterDocID,
                    parentFeedbackDocID: args.parentFeedbackDocID
                }
                
                const response = await addReply(replyData)
                if (response.ok) {
                    return response.reply
                }
                return null
            } catch (error) {
                return null
            }
        }
    }
}

export default PostsResolvers
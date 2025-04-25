import { Schema, model } from 'mongoose'

const baseOptions = {
    discriminatorKey: 'docType',
    collection: 'comments'
}

const CommentsSchema = new Schema({
    noteDocID: { // The noteDocID on which the comment is given
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'posts'
    },
    feedbackContents: {
        type: String, 
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, baseOptions)
const CommentsModel = model('comments', CommentsSchema)


const feedbackSchema = new Schema({
    commenterDocID: { // the user who gave the FEEDBACK
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'students'
    },
    replyCount: {
        type: Number,
        default: 0
    },
    upvoteCount: {
        type: Number,
        default: 0
    }
})
const feedbacksModel = CommentsModel.discriminator('feedbacks', feedbackSchema)


const replySchema = new Schema({
    commenterDocID: { // The user who gave the REPLY on a feedback
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'students'
    },
    parentFeedbackDocID: { // The comment section on which a reply is given. This is currently used to add a reply under a specific comment via the thread-id (thread-parentFeedbackDocID)
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'feedbacks'
    }
})
const replyModel = CommentsModel.discriminator('replies', replySchema)


export default CommentsModel
export {feedbacksModel, replyModel}
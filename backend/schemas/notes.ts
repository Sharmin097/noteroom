import { Schema, model } from 'mongoose'

export enum PostType {
    CONTENT="notes",
    FILE="file",
    LINK="link",
    MCQ="mcq"
}

const baseOptions = {
    discriminatorKey: 'postType',
    collection: 'notes'
}

const notesSchema = new Schema({
    ownerDocID: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'students'
    },
    postID: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        default: null
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    feedbackCount: {
        type: Number,
        default: 0
    },
    upvoteCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    visibility: {
        type: String,
        default: "public"
    },
    completed: {
        type: Boolean,
        default: false
    },
    pinned: {
        type: Boolean,
        default: false
    }
}, baseOptions)
const notesModel = model('notes', notesSchema)

const contentSchema = new Schema({
    content: {
        type: [String],
        default: []
    },
    description: {
        type: String,
        default: null
    }
})
const contentsModel = notesModel.discriminator(PostType.CONTENT, contentSchema)

export default notesModel
export { contentsModel }
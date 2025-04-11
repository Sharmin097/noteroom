import { Schema, model } from 'mongoose'

export enum PostType {
    CONTENT="note",
    FILE="file",
    LINK="link",
    MCQ="mcq"
}

const baseOptions = {
    discriminatorKey: 'postType',
    collection: 'posts'
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
const notesModel = model('posts', notesSchema)

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

const mcqsSchema = new Schema({
    mcqs: [{
        _id: false,
        question: String,
        questionID: {
            type: String,
            required: true
        },
        options: {
            type: [{
                _id: false,
                optionType: String,
                optionText: String,
                optionID: {
                    type: String,
                    required: true
                },
                selectionCount: {
                    type: Number,
                    default: 0
                }
            }]
        },
        correctAnswer: [String]
    }]
})

mcqsSchema.pre("save", function(next) {
    const doc = this as any
    doc.completed = true

    next()
})
const mcqsModel = notesModel.discriminator(PostType.MCQ, mcqsSchema)

const linksSchema = new Schema({
    links: [{ // a list of urls which the user provides
        _id: false,
        type: String,
        required: true 
    }]
})
const linksModel = notesModel.discriminator(PostType.LINK, linksSchema)


const filesSchema = new Schema({
    files: [
        {
            _id: false,
            name: String, // The file name taken from the file itself
            mimeType: {
                type: String,
                enum: ["application/pdf"],
                default: "application/pdf" 
            },
            storageUrl: { // The public url which will be given after uploading the file in firebase
                type: String,
                required: true
            }
        }
    ],
    desscription: {
        type: String,
        default: null
    }
})
const filesModel = notesModel.discriminator(PostType.FILE, filesSchema)


export default notesModel
export { contentsModel, mcqsModel, linksModel, filesModel }
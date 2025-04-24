import { Schema, model } from 'mongoose'

const baseOptions = {
    discriminatorKey: 'docType',
    collection: 'notifications'
}

const NotifsSchema = new Schema({
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    content: {
        type: String,
        default: ''
    },
    notiType: {
        type: String
    },
    redirectTo: {
        type: String,
        default: ''
    },
    ownerStudentID: String
}, baseOptions)
const NotifsModel = model('notifications', NotifsSchema)


const interactionNotifsSchema = new Schema({
    fromUserSudentDocID: {
        type: Schema.Types.ObjectId,
        ref: 'students'
    }
})
const InteractionNotifsModel = NotifsModel.discriminator('interaction', interactionNotifsSchema)



export { 
    NotifsModel as Notifs, 
    InteractionNotifsModel as InteractionNotifs
}
  
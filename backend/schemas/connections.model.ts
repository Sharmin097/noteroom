import { Schema, model } from "mongoose";

const friendsSchema = new Schema({
    senderDocID: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'students'
    },
    receiverDocID: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'students'
    },
    requestID: {
        type: String,
        required: true,
    },
    senderFollowingReceiver: {
        type: Boolean,
        default: true
    },
    receiverFollowingSender: {
        type: Boolean,
        default: false
    }
});

friendsSchema.post("updateOne", async function(result) {
    try {
        const filter = this.getFilter()
        if (!filter.requestID) return
    
        const doc = await this.model.findOne({ requestID: filter.requestID })
        if (doc && !doc.senderFollowingReceiver && !doc.receiverFollowingSender) {
            await doc.deleteOne()
        }
    } catch (error) {
        console.error(error)
    }
})

const friendsModel = model("friends", friendsSchema);
export default friendsModel;

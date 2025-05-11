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

const friendsModel = model("friends", friendsSchema);
export default friendsModel;

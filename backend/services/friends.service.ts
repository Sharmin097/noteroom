import mongoose from "mongoose";
import Friends from "../schemas/connections.model";

export async function sendFriendRequest(request: any) {
    try {
        const existingRequest = await Friends.findOne({connectedUserDocIDs: 
            { $in: [
                [request.senderDocID, request.receiverDocID], 
                [request.receiverDocID, request.senderDocID]
            ] } 
        } );

        if (existingRequest) {
            const selfDocIDIndex = existingRequest.connectedUserDocIDs?.findIndex(docID => docID?.toString() === request.senderDocID?.toString())

            if (selfDocIDIndex === 0) { 
                if (existingRequest?.senderFollowingReceiver) { 
                    return { ok: false, code: "0:SELF_ALREADY_FOLLOWING"} 
                }
                return { ok: false, code: "0:RECEIVER_ALREADY_FOLLOWING"} 
            }
            
            if (existingRequest?.receiverFollowingSender) { 
                return { ok: false, code: "1:SELF_ALREADY_FOLLOWING" }
            }
            return { ok: false, code: "1:RECEIVER_ALREADY_FOLLOWING" } 
        } else {
            await Friends.create(request);
            return { ok: true };
        }

    } catch (error) {
        return { ok: false, error, code: "SERVER" };
    }
}


export async function getFriendRequestById(requestID: string) {
    try {
        const request = await Friends.findOne({ requestID: requestID });
        if (!request) return { ok: false };

        const receiver = await request.populate([
            { path: 'receiverDocID', select: 'studentID' },
        ])
        const receiverInfo = receiver["receiverDocID"]["studentID"]
        return { ok: true, request, receiverInfo };
    } catch (error) {
        return { ok: false, error: error };
    }
}


export async function acceptRequest(requestID: string) {
    try {
        await Friends.updateOne({ requestID }, { $set: { receiverFollowingSender: true } })
        return { ok: true } 
    } catch (error) {
        return { ok: false, error }
    }
}

export async function unfollowRequest(requestID: string, userDocID_of_unfollower: any) {
    try {
        await Friends.updateOne({ requestID }, [
            { $set: { 
                senderFollowingReceiver: {
                    $cond: [
                        { $eq: ["$senderDocID", userDocID_of_unfollower] },
                        false,
                        "$senderFollowingReceiver"
                    ]
                },
                receiverFollowingSender: {
                    $cond: [
                        { $eq: ["$receiverDocID", userDocID_of_unfollower] },
                        false,
                        "$receiverFollowingSender"
                    ]
                }
            } },
        ])
        
        return { ok: true }
    } catch (error) {
        return { ok: false, error }
    }
}

export async function getConnections(userDocID: string, status: "follower" | "following") {
    try {
        const requests = await Friends.aggregate([
            { $match: { 
                ...(status === "follower" && { 
                    $or: [ 
                        { receiverDocID: new mongoose.Types.ObjectId(userDocID), senderFollowingReceiver: true }, 
                        { senderDocID: new mongoose.Types.ObjectId(userDocID), receiverFollowingSender: true } 
                    ] 
                } ),
                ...(status === "following") && {
                    $or: [
                        { senderDocID: new mongoose.Types.ObjectId(userDocID), senderFollowingReceiver: true },
                        { receiverDocID: new mongoose.Types.ObjectId(userDocID), receiverFollowingSender: true }
                    ]
                }
            } },
            { $addFields: {
                other: {
                    $cond: [
                        { $eq: ["$senderDocID", new mongoose.Types.ObjectId(userDocID) ] },
                        "$receiverDocID",
                        "$senderDocID"
                    ]
                }
            } },
            { $lookup: {
                from: "students",
                localField: "other",
                foreignField: "_id",
                as: "other"
            } },
            { $unwind: {
                path: "$other"
            } },
            { $project: {
                _id: 0,
                "other._id": 0
            } }
        ])

        return { ok: true, requests }
    } catch (error) {
        return { ok: false, error }
    }
}

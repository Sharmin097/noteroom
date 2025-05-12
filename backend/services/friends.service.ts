import mongoose from "mongoose";
import Friends from "../schemas/connections.model";

export async function sendFriendRequest(request: any) {
    try {
        const existingRequest = await Friends.findOne({
            senderDocID: request.senderDocID,
            receiverDocID: request.receiverDocID
        });

        if (existingRequest) {
            return { ok: false, code: "EXISTING_REQUEST" };
        }

        await Friends.create(request);
        return { ok: true };
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
        console.error(error)
        return { ok: false, error }
    }
}

export async function getFriendRequests(receiverDocID: string, following: boolean) {
    try {
        const requests = await Friends.aggregate([
            { 
                $match: { 
                    receiverDocID: new mongoose.Types.ObjectId(receiverDocID),
                    ...(following && { receiverFollowingSender: true })
                } 
            },
            {
                $lookup: {
                    from: "students",
                    localField: "senderDocID",
                    foreignField: "_id",
                    as: "sender"
                }
            },
            {
                $unwind: {
                    path: "$sender"
                }
            },
            {
                $project: {
                    _id: 0,
                    "sender._id": 0
                }
            }
        ])

        return { ok: true, requests }
    } catch (error) {
        return { ok: false, error }
    }
}

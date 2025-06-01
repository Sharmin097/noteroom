import mongoose from "mongoose";
import Friends from "../schemas/connections.model";

export async function sendFriendRequest(request: any) {
    const context = sendFriendRequest.name
    try {
        const existingRequest = await Friends.findOne({
            connectedUserDocIDs:
            {
                $in: [
                    [request.senderDocID, request.receiverDocID],
                    [request.receiverDocID, request.senderDocID]
                ]
            }
        });

        if (existingRequest) {
            const selfDocIDIndex = existingRequest.connectedUserDocIDs?.findIndex(docID => docID?.toString() === request.senderDocID?.toString())

            if (selfDocIDIndex === 0) {
                if (existingRequest?.senderFollowingReceiver) {
                    return { ok: false, code: "0:SELF_ALREADY_FOLLOWING", context }
                }
                return { ok: false, code: "0:RECEIVER_ALREADY_FOLLOWING", context }
            }

            if (existingRequest?.receiverFollowingSender) {
                return { ok: false, code: "1:SELF_ALREADY_FOLLOWING", context }
            }
            return { ok: false, code: "1:RECEIVER_ALREADY_FOLLOWING", context }
        } else {
            await Friends.create(request);
            return { ok: true, context };
        }

    } catch (error) {
        return { ok: false, error, code: "SERVER", context };
    }
}


export async function getFriendRequestByRequestID(requestID: string) {
    const context = getFriendRequestByRequestID.name
    try {
        const request = await Friends.findOne({ requestID: requestID });
        if (!request) return { ok: false, context };

        const receiver = await request.populate([
            { path: 'receiverDocID', select: 'studentID' },
        ])
        const receiverInfo = receiver["receiverDocID"]["studentID"]
        return { ok: true, request, receiverInfo, context };
    } catch (error) {
        return { ok: false, error: error, context };
    }
}


export async function acceptRequest(requestID: string) {
    const context = acceptRequest.name
    try {
        await Friends.updateOne({ requestID }, { $set: { receiverFollowingSender: true } })
        return { ok: true, context }
    } catch (error) {
        return { ok: false, error, context }
    }
}

export async function unfollowRequest(requestID: string, userDocID_of_unfollower: any) {
    const context = unfollowRequest.name
    try {
        await Friends.updateOne({ requestID }, [
            {
                $set: {
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
                }
            },
        ])

        return { ok: true, context }
    } catch (error) {
        return { ok: false, error, context }
    }
}

export async function getConnections(userDocID: string, status: "follower" | "following") {
    try {
        const requests = await Friends.aggregate([
            {
                $match: {
                    ...(status === "follower" && {
                        $or: [
                            { receiverDocID: new mongoose.Types.ObjectId(userDocID), senderFollowingReceiver: true },
                            { senderDocID: new mongoose.Types.ObjectId(userDocID), receiverFollowingSender: true }
                        ]
                    }),
                    ...(status === "following") && {
                        $or: [
                            { senderDocID: new mongoose.Types.ObjectId(userDocID), senderFollowingReceiver: true },
                            { receiverDocID: new mongoose.Types.ObjectId(userDocID), receiverFollowingSender: true }
                        ]
                    }
                }
            },
            {
                $addFields: {
                    other: {
                        $cond: [
                            { $eq: ["$senderDocID", new mongoose.Types.ObjectId(userDocID)] },
                            "$receiverDocID",
                            "$senderDocID"
                        ]
                    }
                }
            },
            {
                $lookup: {
                    from: "students",
                    localField: "other",
                    foreignField: "_id",
                    as: "other"
                }
            },
            {
                $unwind: {
                    path: "$other"
                }
            },
            {
                $project: {
                    _id: 0,
                    "other._id": 0
                }
            }
        ])

        return { ok: true, requests }
    } catch (error) {
        return { ok: false, error }
    }
}

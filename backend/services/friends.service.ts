import mongoose from "mongoose";
import Follow from "../schemas/follow.model";
import Friends from "../schemas/friends.model";

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

export async function updateFriendRequestStatus(requestID: string, status: 'accepted' | 'declined') {
    try {
        const result = await Friends.updateOne(
            { requestID },
            { $set: { status } }
        );

        if (result.modifiedCount > 0) {
            return { ok: true };
        } else {
            return { ok: false, code: "UNMODIFIED_DOC" };
        }
    } catch (error: any) {
        return { ok: false, error: error, code: "SERVER" };
    }
}

export async function unfriendUser(requestID: string) {
    try {
        const result = await Friends.deleteOne({ requestID, status: "accepted" });
        if (result.deletedCount > 0) return { ok: true };
        return { ok: false, code: "DELETION_FAILURE" };
    } catch (error) {
        return { ok: false, error: error, code: "SERVER" };
    }
}

export async function followUser(followID: any, follower: any, following: any) {
    try {
        const followInfo = await Follow.findOne({
            followerDocID: follower,
            followingDocID: following
        });

        if (followInfo) {
            return { ok: true, code: "EXISTING_FOLLOW" }
        }

        await Follow.create({
            followID: followID,
            followerDocID: follower,
            followingDocID: following
        });

        return { ok: true };
    } catch (error) {
        return { ok: false, error: error }
    }
}

export async function unfollowUser(followID: any) {
    try {
        const followInfo = await Follow.findOne({
            followID: followID
        });
        if (followInfo) {
            await Follow.deleteOne({ followID: followInfo.followID });
            return { ok: true };
        }
        else {
            return { ok: false }
        }

    } catch (error) {
        return { ok: false, error };
    }
}

export async function getFriendRequests(receiverDocID: string, requestStatus: "accepted" | "declined" | "pending" = "pending") {
    try {
        const requests = await Friends.aggregate([
            { $match: { receiverDocID: new mongoose.Types.ObjectId(receiverDocID), status: requestStatus } },
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

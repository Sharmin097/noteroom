import mongoose from "mongoose"
import Requests from "../../schemas/requests"


interface RequestObject {
	recID: string,
	senderDisplayName: string,
	createdAt: string,
	message: string
}

export async function getRequest(requestID: string) {
    try {
        const request = await Requests.findOne({ _id: requestID })
        const populatedRequestData = await request.populate([
            { path: 'senderDocID', select: 'studentID' },
        ])
        return { ok: true, data: {
            receiverDocID: populatedRequestData["receiverDocID"]["_id"],
            senderStudentID: populatedRequestData["senderDocID"]["studentID"]
        } }
    } catch (error) {
        return { ok: false }
    }
}

export async function getRequests(ownerDocID: string) {
    try {
        const requestData: RequestObject[] = await Requests.aggregate([
            { $match: { receiverDocID: new mongoose.Types.ObjectId(ownerDocID) } },
            { $lookup: {
                from: "students",
                localField: "senderDocID",
                foreignField: "_id",
                as: "senderDocID"
            } },
            { $project: {
                _id: 0,
                recID: "$_id",
                createdAt: 1,
                message: 1,
                senderDisplayName: {
                    $first: "$senderDocID.displayname"
                }
            } }
        ])

        return { ok: true, requests: requestData }
    } catch (error) {
        return { ok: false }
    }
}

export async function addRequest(reqdata: any) {
    try {
        const requestDocument = await Requests.create(reqdata)
        const populatedRequestData = await requestDocument.populate([
            { path: 'senderDocID', select: 'studentID username displayname profile_pic' },
            { path: 'receiverDocID', select: 'studentID username displayname profile_pic' }
        ]) 
        const requestData: RequestObject = {
            recID: populatedRequestData["_id"].toString(),
            senderDisplayName: populatedRequestData["senderDocID"]["displayname"],
            createdAt: populatedRequestData["createdAt"].toString(),
            message: populatedRequestData["message"]
        }
        return { ok: true, data: {
            receiverStudentID: populatedRequestData["receiverDocID"]["studentID"],
            requestData: requestData
        } }
    } catch (error) {
        return { ok: false }
    }
}
export async function deleteRequest(reqID: string) {
    try {
        let deleteResult = await Requests.deleteOne({ _id: reqID })
        return { ok: deleteResult.deletedCount !== 0 }
    } catch (error) {
        return { ok: false }
    }
}

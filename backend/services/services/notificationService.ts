import { Server } from "socket.io"
import { Notifs, InteractionNotifs } from "../../schemas/notifications"
import { userSocketMap } from "../../server"


export enum NotificationEvent {
    NOTIF_COMMENT = 'notification-comment',
    NOTIF_REQUEST = 'notification-request',
    NOTIF_REQUEST_ACCEPT = 'notification-request-accept',
    NOTIF_REQUEST_DECLINE = 'notification-request-decline'
}

export function NotificationSender(io: Server, options?: { ownerStudentID: string, redirectTo?: string }) {
    return {
        async sendNotification({content, event, isInteraction, fromUserSudentDocID, additional}: any) {
            try {
                let ownerStudentID = options.ownerStudentID
                let redirectTo = options.redirectTo || null

                let baseDocument = {
                    notiType: event,
                    content: content,
                    redirectTo: redirectTo,
                    ownerStudentID: ownerStudentID
                }

                let notification_db = isInteraction ? { ...baseDocument, fromUserSudentDocID } : baseDocument 
                let notification_document = isInteraction ? await addInteractionNoti(notification_db) : await addNoti(notification_db)

                let notification_io = {
                    notiID: notification_document["_id"].toString(),
                    content: notification_db.content,
                    redirectTo: redirectTo,
                    isRead: false,
                    isInteraction: isInteraction,
                    notiType: event,
                    createdAt: notification_document["createdAt"],
                    fromUser: isInteraction ? notification_document["fromUserSudentDocID"] : null,
                    additional: additional || null
                }
                io.to(userSocketMap.get(ownerStudentID)).emit(event, notification_io)

                return { ok: true }
            } catch (error) {
                console.error(error)
                return { ok: false }
            }
        }
    }
}

export async function getNotifications(ownerStudentID: string) {
    try {
        let notifications = await Notifs.aggregate([
            { $match: { ownerStudentID: ownerStudentID } },
            { $lookup: {
                from: "students",
                localField: "fromUserSudentDocID",
                foreignField: "_id",
                as: "fromUserSudentDocID"
            } },
            { $unwind: {
                path: "$fromUserSudentDocID",
                preserveNullAndEmptyArrays: true
            } },
            { $addFields: {
                isInteraction: { $eq: ["$docType", "interaction"] },
                fromUser: {
                    profile_pic: "$fromUserSudentDocID.profile_pic", 
                    displayname: "$fromUserSudentDocID.displayname", 
                    username: "$fromUserSudentDocID.username"
                },
            } },
            { $project: {
                _id: 0,
                notiID: "$_id", title: 1, content: 1, isRead: 1, createdAt: 1, notiType: 1, isInteraction: 1,
                fromUser: {
                    $cond: {
                        if: { $eq: [ { $size: { $objectToArray: "$fromUser" } }, 0 ] },
                        then: "$$REMOVE",
                        else: "$fromUser"
                    }
                }
            } }
        ])
        return { ok: true, notifications }
    } catch (error) {
        console.error(error)
        return { ok: false }
    }
}


export async function deleteAllNoti(ownerStudentID: string) {
    try {
        let result = await Notifs.deleteMany({ ownerStudentID: ownerStudentID })
        return result.deletedCount !== 0
    } catch (error) {
        return false
    }
}


export async function readNoti(notiID: string) {
    try {
        await Notifs.updateOne({ _id: notiID }, { $set: { isRead: true } })
        return { ok: true }
    } catch (error) {
        return { ok: false }
    }
}

export async function deleteNoti(notiID: string) {
    await Notifs.deleteOne({ _id: notiID })
}

export async function addNoti(notiData: any) {
    let data = await Notifs.create(notiData)
    return data
}
export async function addInteractionNoti(notiData: any) {
    let data = await InteractionNotifs.create(notiData)
    return data.populate('fromUserSudentDocID', 'displayname username profile_pic')
}
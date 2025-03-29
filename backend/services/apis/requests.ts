import { Router } from "express";
import { Server } from "socket.io";
import { Convert } from "../services/userService";
import { addRequest, deleteRequest, getRequest, getRequests } from "../services/requestService";
import { NotificationEvent, NotificationSender } from "../services/notificationService";
import { userSocketMap } from "../../server";

const router = Router()

export default function requestsApiRouter(io: Server) {
    router.post('/:requestID/accept', async (req, res) => {
        try {
            const requestID = req.params.requestID
            const response = await getRequest(requestID)
            if (response.ok) {
                const { receiverDocID, senderStudentID } = response.data

                await NotificationSender(io, {
                    ownerStudentID: senderStudentID,
                    redirectTo: `/post/${req.body.postID}`
                }).sendNotification({
                    content: `have accepted your request and sent you a resource. Click to see`,
                    event: NotificationEvent.NOTIF_REQUEST_ACCEPT,
                    isInteraction: true,
                    fromUserSudentDocID: receiverDocID
                })

                const deleteResponse = await deleteRequest(requestID)
                res.json({ ok: deleteResponse && true })
            } else {
                res.json({ ok: false, message: "Request cannot be accepted! Try again a bit later." })
            }
        } catch (error) {
            res.json({ ok: false, message: "Request cannot be accepted! Try again a bit later." })
        }
    })

    router.post('/:requestID/decline', async (req, res) => {
        try {
            const requestID = req.params.requestID
            const message = req.body.message
            const response = await getRequest(requestID)
            if (response.ok) {
                const { receiverDocID, senderStudentID } = response.data

                await NotificationSender(io, {
                    ownerStudentID: senderStudentID,
                }).sendNotification({
                    content: `have decliend your request saying "${message}"`,
                    event: NotificationEvent.NOTIF_REQUEST_DECLINE,
                    isInteraction: true,
                    fromUserSudentDocID: receiverDocID
                })

                const deleteResponse = await deleteRequest(requestID)
                res.json({ ok: deleteResponse && true })
            } else {
                res.json({ ok: false, message: "Request cannot be delined! Try again a bit later." })
            }
        } catch (error) {
            res.json({ ok: false, message: "Request cannot be declined! Try again a bit later." })
        }
    })

    router.get("/", async (req, res) => {
        try {
            let studentID = req.session["stdid"]
            let studentDocID = (await Convert.getDocumentID_studentid(studentID)).toString()
            let response = await getRequests(studentDocID)
            if (response.ok) {
                res.json({ ok: true, requests: response.requests })         
            } else {
                res.json({ ok: false })
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })

    router.post('/send', async (req, res) => {
        try {
            let senderStudentID = req.session["stdid"]
            let senderDocID = await Convert.getDocumentID_studentid(senderStudentID)

            let receiverUsername = req.body.receiverUsername
            let receiverDocID = await Convert.getDocumentID_username(receiverUsername)

            if (senderDocID !== receiverDocID) {
                const requestData = {
                    senderDocID, receiverDocID,
                    message: req.body.message
                }
    
                const response = await addRequest(requestData)
                if (response.ok) {
                    const { requestData, receiverStudentID } = response.data
                    io.to(userSocketMap.get(receiverStudentID)).emit('request-object', requestData)

                    await NotificationSender(io, {
                        ownerStudentID: receiverStudentID,
                    }).sendNotification({
                        content: `have sent you a request`,
                        event: NotificationEvent.NOTIF_REQUEST,
                        isInteraction: true,
                        fromUserSudentDocID: senderDocID
                    })

                    res.json({ ok: true })
                } else {
                    res.json({ ok: false, message: "Request can't be sent successfully!" })
                }
            } else {
                res.json({ ok: false, message: "You can't send a request to yourself! "})
            }

        } catch (error) {
            
        }
    })


    return router
}

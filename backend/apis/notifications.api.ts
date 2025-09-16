import { Router } from "express";
import { Server } from "socket.io";
import { deleteAllNoti, getNotifications, readNoti } from "../services/notification.service";

const router = Router()

export default function notificationApiRouter(io: Server) {
    router.delete("/", async (req, res) => {
        try {
            let studentID = req.session["stdid"]
            let deletedResult = await deleteAllNoti(studentID)
            res.json({ ok: deletedResult })
        } catch (error) {
            res.json({ ok: false })
        }
    })

    router.get("/:notificationID/read", async (req, res) => {
        try {
            const notiID = req.params.notificationID
            const response = await readNoti(notiID)
            res.json({ ok: response.ok })
        } catch (error) {
            res.json({ ok: false })
        }
    })

    return router
}

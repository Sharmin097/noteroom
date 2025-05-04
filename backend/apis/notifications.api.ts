import { Router } from "express";
import { Server } from "socket.io";
import { deleteAllNoti, getNotifications, readNoti } from "../services/notification.service";

const router = Router()

export default function notificationApiRouter(io: Server) {
    //DEPRECATED
    router.get("/", async (req, res) => {
        try {
            let studentID = req.session["stdid"]
            let response = await getNotifications(studentID)
            // if (response.ok) {
            //     res.json({ ok: true, notifications: response.notifications })
            // } else {
            //     res.json({ ok: false })
            // }
        } catch (error) {
            res.json({ ok: false })
        }
    })

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

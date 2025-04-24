import { Router } from "express";
import { Server } from "socket.io";
import { getPosts } from "../services/post.service";
import { Convert } from "../services/user.service";
import logger from "../logger";

const router = Router()

export default function feedApiRouter(io: Server) {
    router.get("/", async (req, res) => {
        try {
            const count = 7
            const page = Number(req.query.page) || 1
            const seed: number = Number(req.query.seed)
            const skip: number = (page - 1) * count

            let studentDocID = (await Convert.getDocumentID_studentid(req.session["stdid"])).toString()
            logger.info(`(/feed): Converted to documentID from studentID=${req.session["stdid"] || '--studentID--'}`)
            let notes = await getPosts(studentDocID, { skip: skip, limit: count, seed: seed })
            logger.info(`(/feed): Got posts of page=${page}, skip=${skip} of studentID=${req.session["stdid"] || '--studentID--'}`)
            if (notes.length != 0) {
                res.json(notes)
            } else {
                res.json([])
            }
        } catch (error) {
            logger.error(`(/feed): Failed to fetch posts of studentID=${req.session["stdid"] || '--studentID--'}: ${error}`)
            res.json([])
        }
    })

    return router
}

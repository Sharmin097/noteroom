import { Router } from "express";
import { Server } from "socket.io";
import { searchStudent } from "../services/user.service";
import { searchPosts } from "../services/post.service";

export const router = Router()
export default function seacrhApiRouter(io: Server) {
    router.get("/", async (req, res) => {
        try {
            if (req.query) {
                const term = <string>req.query.q
                const type = <"profiles" | "posts">req.query.type
                const countDoc = req.query.countdoc ? true : false

                let batch = Number(req.query.batch || "1")
                let maxCount = 20
                let skip = (batch - 1) * maxCount

                if (type === "profiles") {
                    const students = await searchStudent(term, { maxCount: maxCount, skip: skip, countDoc })
                    res.json(students)
                } else if (type === "posts") {
                    //TODO: batch search on search posts
                    const response = await searchPosts(term)
                    if (response.ok) {
                        res.json({ ok: true, posts: response.posts })
                    } else {
                        res.json({ ok: false })
                    }
                }
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })

    return router
}

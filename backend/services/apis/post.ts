import { Router } from "express";
import { Server } from "socket.io";
import { getSinglePost, addSavePost, deleteSavedPost, getSavedPosts } from "../services/postService";
import { addFeedback, addReply, getComments } from "../services/feedbackService";
import { addVote, deleteVote } from "../services/voteService";
import { Convert } from "../services/userService";
import { NotificationEvent, NotificationSender } from "../services/notificationService";

const router = Router()
export default function postApiRouter(io: Server) {
    //TODO: vote should send notifications

    router.get("/:postID/metadata", async (req, res) => {
        try {
            let studentID = req.session["stdid"]
            let studentDocID = (await Convert.getDocumentID_studentid(studentID)).toString()
            let response: any = await getSinglePost(req.params.postID, studentDocID, { images: false })
            if (response.ok) {
                res.json({ ok: true, noteData: response.noteData })
            } else {
                res.json({ ok: false })
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })

    router.get("/:postID/images", async (req, res) => {
        try {
            let response: any = await getSinglePost(req.params.postID, null, { images: true })
            if (response.ok) {
                res.json({ ok: true, images: response.images })
            } else {
                res.json({ ok: false })
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })

    router.get("/:postID/comments", async (req, res) => {
        try {
            let postID = req.params.postID
            let studentDocID = (await Convert.getDocumentID_studentid(req.session["stdid"])).toString()
            let response = await getComments({ noteDocID: postID, studentDocID })
            if (response.ok) {
                res.json({ ok: true, comments: response.comments })
            } else {
                res.json({ ok: false })
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })

    router.put("/:postID/save", async (req, res) => {
        try {
            let postID = req.params.postID
            let action = <"save" | "delete">req.query["action"]
            let studentDocID = (await Convert.getDocumentID_studentid(req.session["stdid"])).toString()
    
            if (action === 'save') {
                let response = await addSavePost({ studentDocID, noteDocID: postID })
                res.json({ ok: response.ok })
            } else {
                let response = await deleteSavedPost({ studentDocID, noteDocID: postID })
                res.json({ ok: response.ok })
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })

    router.post("/:postID/feedbacks", async (req, res) => {
        try {
            const postID = req.params.postID
            const studentID = req.session["stdid"]
            const feedbackContent = req.body.feedbackContent
            const commenterDocID = (await Convert.getDocumentID_studentid(studentID)).toString()
            
            const feedbackData = {
                noteDocID: postID,
                commenterDocID: commenterDocID,
                feedbackContents: feedbackContent
            }
            const response = await addFeedback(feedbackData)
            if (response.ok) {
                const { feedback } = response 

                const toStudentID = feedback["noteDocID"]["ownerDocID"]["studentID"];
                const fromStudentID = feedback["commenterDocID"]["studentID"]

                if (toStudentID !== fromStudentID) {
                    await NotificationSender(io, {
                        ownerStudentID: toStudentID,
                        redirectTo: `/post/${postID}`
                    }).sendNotification({
                        content: `gave you a comment on "${feedback["noteDocID"]["title"]}". Check it out!`,
                        event: NotificationEvent.NOTIF_COMMENT,
                        isInteraction: true,
                        fromUserSudentDocID: feedback["commenterDocID"]["_id"]
                    })
                }
                res.json({ ok: true, feedback: feedback })
            } else {
                res.json({ ok: false })
            }
        } catch (error) {
            console.error(error)
            res.json({ ok: false })
        }
    })

    router.post("/:postID/feedbacks/:feedbackID/vote", async (req, res) => {
        try {
            const postID = req.params.postID
            const feedbackID = req.params.feedbackID
            const voterStudentDocID = await Convert.getDocumentID_studentid(req.session["stdid"])
            const voteType = <"upvote" | "downvote">req.query["type"]
            if (voteType === "upvote") {
                const response = await addVote({ voteType, noteDocID: postID, voterStudentDocID: voterStudentDocID }, "comment", feedbackID)
                res.json({ ok: response.ok })
            } else {
                const response = await deleteVote({ noteDocID: postID, voterStudentDocID }, "comment", feedbackID)
                res.json({ ok: response.ok })
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })

    router.post("/:postID/feedbacks/:feedbackID/replies", async (req, res) => {
        try {
            const postID = req.params.postID
            const studentID = req.session["stdid"]
            const replyContent = req.body.replyContent
            const parentFeedbackDocID = req.params.feedbackID 
            const replyToUsername = req.body.replyToUsername
            const replierDocID = (await Convert.getDocumentID_studentid(studentID)).toString()

            const replyData = {
                noteDocID: postID,
                feedbackContents: replyContent,
                commenterDocID: replierDocID,
                parentFeedbackDocID: parentFeedbackDocID
            }
            const response = await addReply(replyData)
            if (response.ok) {
                const { reply } = response

                const toStudentID = await Convert.getStudentID_username(replyToUsername)
                const fromStudentID = reply["commenterDocID"]["studentID"]

                if (toStudentID !== fromStudentID) {
                    await NotificationSender(io, {
                        ownerStudentID: toStudentID,
                        redirectTo: `/post/${postID}`
                    }).sendNotification({
                        content: `gave a reply on your comment on "${reply["noteDocID"]["title"]}". Check it out!`,
                        event: NotificationEvent.NOTIF_COMMENT,
                        isInteraction: true,
                        fromUserSudentDocID: reply["commenterDocID"]["_id"]
                    })
                }

                res.json({ ok: true, reply: response.reply })
            } else {
                res.json({ ok: false })
            }
        } catch (error) {
            res.json({ ok: true })
        }
    })

    router.post("/:postID/vote", async (req, res) => {
        try {
            const postID = req.params.postID
            const action = req.query["action"]
            const voterStudentID = req.session["stdid"]
            const voterStudentDocID = (await Convert.getDocumentID_studentid(voterStudentID)).toString()
            const voteType = <"upvote" | "downvote">req.query["type"]
            
            if (!action) {
                let response = await addVote({ voteType, noteDocID: postID, voterStudentDocID: voterStudentDocID }, "post")
                res.json({ ok: response.ok })
            } else {
                let response = await deleteVote({ noteDocID: postID, voterStudentDocID }, "post")
                res.json({ ok: response.ok })
            }

        } catch (error) {
            res.json({ ok: false })
        }
    })

    router.get("/saved", async (req, res) => {
        try {
            let studentID = req.session["stdid"]
            let response = await getSavedPosts(studentID)
            if (response.ok) {
                res.json({ ok: true, posts: response.posts })
            } else {
                res.json({ ok: false })
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })

    return router
}

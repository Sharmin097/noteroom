import { Router } from "express";
import { Server } from "socket.io";
import { getSinglePost, addSavePost, deleteSavedPost, getSavedPosts } from "../services/post.service";
import { addFeedback, addReply } from "../services/feedback.service";
import { addVote, deleteVote } from "../services/vote.service";
import { Convert } from "../services/user.service";
import { NotificationEvent, NotificationSender } from "../services/notification.service";
import notesModel from "../schemas/posts.model";
import { getDeck, savePostToDeck } from "../services/decks.service";
import logger from "../logger";
import rateLimit from 'express-rate-limit';
import { joinLogContexts } from "../services/utils";

const router = Router()
export default function postApiRouter(io: Server, context: { rootContext: string }) {
    router.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: { ok: false, message: 'Too many requests, please try again later.' }
    }))
    
    router.put("/:postID/save", async (req, res) => {
        try {
            const postDocID = (await notesModel.findOne({ postID: req.params.postID }, { _id: 1 }))._id.toString()
            const action = <"save" | "delete">req.query["action"]
            const studentDocID = (await Convert.getDocumentID_studentid(req.session["stdid"])).toString()

            if (action === 'save') {
                let response = await addSavePost({ studentDocID, noteDocID: postDocID })
                res.json({ ok: response.ok })
            } else {
                let response = await deleteSavedPost({ studentDocID, noteDocID: postDocID })
                res.json({ ok: response.ok })
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })

    router.post("/:postID/feedbacks/:feedbackID/vote", async (req, res) => {
        try {
            const postDocID = (await notesModel.findOne({ postID: req.params.postID }, { _id: 1 }))._id.toString()
            const feedbackID = req.params.feedbackID
            const voterStudentDocID = await Convert.getDocumentID_studentid(req.session["stdid"])
            const voteType = <"upvote" | "downvote">req.query["type"]
            if (voteType === "upvote") {
                const response = await addVote({ voteType, noteDocID: postDocID, voterStudentDocID: voterStudentDocID }, "comment", feedbackID)
                res.json({ ok: response.ok })
            } else {
                const response = await deleteVote({ noteDocID: postDocID, voterStudentDocID }, "comment", feedbackID)
                res.json({ ok: response.ok })
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })

    router.post("/:postID/vote", async (req, res) => {
        try {
            const postDocID = (await notesModel.findOne({ postID: req.params.postID }, { _id: 1 }))._id.toString()
            const action = req.query["action"]
            const voterStudentID = req.session["stdid"]
            const voterStudentDocID = (await Convert.getDocumentID_studentid(voterStudentID)).toString()
            const voteType = <"upvote" | "downvote">req.query["type"]

            if (!action) {
                let response = await addVote({ voteType, noteDocID: postDocID, voterStudentDocID: voterStudentDocID }, "post")
                res.json({ ok: response.ok })
            } else {
                let response = await deleteVote({ noteDocID: postDocID, voterStudentDocID }, "post")
                res.json({ ok: response.ok })
            }

        } catch (error) {
            res.json({ ok: false })
        }
    })

    router.get("/:postID/save", async (req, res: any) => {
        try {
            const studentID = req.session?.["stdid"];
            if (!studentID) return

            const { postID } = req.params;
            const { deckID } = req.query;

            if (!postID) {
                return res.json({ ok: false, message: "Invalid post ID format" });
            }

            if (!deckID || typeof deckID !== 'string') {
                return res.json({ ok: false, message: "Deck ID is required and must be a string" });
            }

            const ownerDocID = await Convert.getDocumentID_studentid(studentID);
            if (!ownerDocID) {
                logger.error(`Failed to get owner document`, { entity: 'api', root: joinLogContexts(context.rootContext, ['save']), action: 'ownerDocID-not-found' }, { studentID })
                return res.json({ ok: false, message: "Internal server error" });
            }

            const deckDoc = await getDeck(deckID, ownerDocID);
            if (!deckDoc) {
                logger.error(`Unauthorized deck access attempt, ownerDocID doesn't own this deck`, { entity: 'api', root: joinLogContexts(context.rootContext, ['save', deckDoc.context]), action: 'deck-unauthorized' }, { response: 'failed', deckID, error: deckDoc.error.message, studentID, ownerDocID })
                return res.json({ ok: false, message: "Invalid deck or unauthorized" });
            }
            
            const postDoc = await notesModel.findOne({ postID: postID })
            if (postDoc) {
                const postDocID = postDoc._id.toString()
                const result = await savePostToDeck(deckID, ownerDocID, postDocID);
                if (!result.ok) {
                    logger.error(`Saving post in deck failed`, { entity: 'api', root: joinLogContexts(context.rootContext, ['save', result.context]), action: 'save-post-deck-failure' }, { response: 'failed', deckID, error: result.error.message, studentID })
                    return res.json({ ok: false, message: "Failed to save post to deck" });
                }
                
                logger.info(`Post saved in deck`, { entity: 'api', root: joinLogContexts(context.rootContext, ['save', result.context]), action: 'save-post-deck-success' }, { response: 'success', deckID, studentID })
                return res.json({ ok: true });
            } else {
                logger.error(`Couldn't get post`, { entity: 'api', root: joinLogContexts(context.rootContext, ['save']), action: 'post-not-found' }, { postID, studentID })
                return res.json({ ok: false, message: "Failed to save post to deck" });
            }
        } catch (error) {
            logger.info(`Saving post in deck failed`, { entity: 'api', root: joinLogContexts(context.rootContext, ['save']), action: 'save-post-deck-api-failure' }, { error: error.message })            
            return res.json({ ok: false, message: "Failed to save post to deck" });
        }
    });

    return router
}

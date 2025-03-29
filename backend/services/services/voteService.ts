import Votes, { CommentVotes } from "../../schemas/votes"
import Notes from "../../schemas/notes"
import { feedbacksModel } from "../../schemas/comments"
export async function isUpVoted({ noteDocID, voterStudentDocID }) {
    let upvote_doc = await Votes.findOne({ 
        $and: [ 
            { docType: { $ne: 'feedback' } }, 
            { noteDocID: noteDocID }, 
            { voterStudentDocID: voterStudentDocID } 
        ] })
    return upvote_doc ? true : false
}

export async function isCommentUpVoted({ feedbackDocID, voterStudentDocID }) {
    let upvote_doc = await CommentVotes.findOne({ 
        $and: [ 
            { docType: { $eq: 'feedback' } }, 
            { feedbackDocID: feedbackDocID }, 
            { voterStudentDocID: voterStudentDocID } 
        ] })
    return upvote_doc ? true : false
}


export async function deleteVote({ noteDocID, voterStudentDocID }, on: "post" | "comment", feedbackDocID?: any) {
    try {
        if (on === "post") {
            const deleteResult = await Votes.deleteOne({ noteDocID, voterStudentDocID })
            if (deleteResult.deletedCount !== 0) {
                await Notes.updateOne({ _id: noteDocID }, { $inc: { upvoteCount: -1 } })
                return { ok: true }
            } else {
                return { ok: false }
            }
        } else {
            const deleteResult = await Votes.deleteOne({ noteDocID, voterStudentDocID, docType: "feedback" })
            if (deleteResult.deletedCount !== 0) {
                await feedbacksModel.updateOne({ _id: feedbackDocID }, { $inc: { upvoteCount: -1 } })
                return { ok: true }
            } else {
                return { ok: false }
            }
        }
    } catch (error) {
        return { ok: false }
    }
}

export async function addVote({ noteDocID, voterStudentDocID, voteType }, on: "post" | "comment", feedbackDocID?: any) {
    try {
        if (on === "post") {
            const voteData = await Votes.create({noteDocID, voterStudentDocID, voteType})
            if (voteData) {
                await Notes.findByIdAndUpdate(noteDocID, { $inc: { upvoteCount : 1 } })
                return { ok: true }
            } else {
                return { ok: false }
            }
        } else {
            const voteData = await CommentVotes.create({noteDocID, voterStudentDocID, voteType, feedbackDocID})
            if (voteData) {
                await feedbacksModel.updateOne({ _id: feedbackDocID }, { $inc: { upvoteCount: 1 } })
                return { ok: true }
            } else {
                return { ok: false }
            }
        }
    } catch (error) {
        return { ok: false }
    }
}
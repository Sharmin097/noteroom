import Notes from "../../schemas/notes"
import Students from "../../schemas/students"
import mongoose from "mongoose"
import { isUpVoted } from "./voteService"

interface SavedNoteObject {
    noteID: string,
    noteTitle: string,
	noteThumbnail: string
}

export async function addPost(noteData: any) {
    let note = await Notes.create(noteData)
    await Students.findByIdAndUpdate(
        noteData.ownerDocID,
        { $push: { owned_notes: note._id } },
        { upsert: true, new: true }
    )
    return note
}

async function isSaved({ studentDocID, noteDocID }) {
    let document = await Students.find({ $and: 
        [ 
            { _id: studentDocID }, 
            { saved_notes: { $in: [noteDocID] } } 
        ]
    })
    return document.length !== 0 ? true : false
}
export async function getPosts(studentDocID: string, options?: any) { 
    /*
    Linear Congruential Generator (LCG):
        X_n+1 = (A * X_n + C) mod M

        A = feedbackCount + 1234567
        C = (upvoteCount + 10) × 9876543 + (contentSize × 22695477)
        M = 2 ^ 32
        X_n = seed
    */
    let notes = await Notes.aggregate([
        { $match: { completed: { $eq: true }, type_: "public" } },
        { $lookup: {
            from: 'students',
            localField: 'ownerDocID',
            foreignField: '_id',
            as: 'ownerDocID'
        } },
        { $addFields: {
            A: { $add: [ "$feedbackCount", 1234567 ] },
            C: { $add: [
                { $multiply: [{ $add: [ "$upvoteCount", 10 ] }, 9876543] },
                { $multiply: [{ $add: [{ $size: "$content" }, 1] }, 22695477] }
            ]}
        } },
        { $addFields: {
            randomSort: { 
                $mod: [
                    { $add: [{ $multiply: ["$A", parseInt(options.seed)] }, "$C"] },
                    Math.pow(2, 32)
                ] 
            }
        } },
        { $unwind: {
            path: '$ownerDocID',
        } },
        { $project: {
            title: 1, description: 1,  
            feedbackCount: 1, upvoteCount: 1, 
            postType: 1, content: 1, randomSort: 1,
            createdAt: 1, pinned: 1,
            "ownerDocID._id": 1,
            "ownerDocID.profile_pic": 1,
            "ownerDocID.displayname": 1,
            "ownerDocID.studentID": 1,
            "ownerDocID.username": 1
        } },
        { $addFields: {
            isOwner: { $eq: ["$ownerDocID._id", new mongoose.Types.ObjectId(studentDocID)] }
        } },
        { $sort: { pinned: -1, randomSort: 1 } },
        { $skip: parseInt(options.skip) },
        { $limit: parseInt(options.limit) }
    ])
    
    let extentedNotes = await Promise.all(
        notes.map(async (note: any) => {
            let isupvoted = await isUpVoted({ noteDocID: note["_id"].toString(), voterStudentDocID: studentDocID })
            let issaved = await isSaved({ noteDocID: note["_id"].toString(), studentDocID: studentDocID }) 
            return { ...note, isUpvoted: isupvoted, isSaved: issaved }
        })
    )

    return extentedNotes
}


export async function getSinglePost(noteDocID: string, studentDocID: string, options: { images: boolean }) {
    try {
        if (!options.images) {
            let notes = await Notes.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(noteDocID) } },
                { $lookup: {
                    from: 'students',
                    localField: 'ownerDocID',
                    foreignField: '_id',
                    as: 'ownerDocID'
                }},
                { $unwind: {
                    path: "$ownerDocID"
                } },
                { $project: {
                    title: 1, description: 1,  
                    feedbackCount: 1, upvoteCount: 1, 
                    postType: 1, content: 1, randomSort: 1, //FIXME: content is only needed for content counting. so send content count instead of content
                    createdAt: 1, pinned: 1,
                    "ownerDocID._id": 1,
                    "ownerDocID.profile_pic": 1,
                    "ownerDocID.displayname": 1,
                    "ownerDocID.studentID": 1,
                    "ownerDocID.username": 1
                }},
                { $addFields: {
                    isOwner: { $eq: ["$ownerDocID._id", new mongoose.Types.ObjectId(studentDocID)] }
                }}
            ]);
        
            if (!notes.length) {
                return { ok: false }
            }
        
            let note = notes[0];
            let isUpvoted = await isUpVoted({ noteDocID, voterStudentDocID: studentDocID });
            let _isSaved = await isSaved({ studentDocID, noteDocID });
        
            return { ok: true, noteData: { ...note, isUpvoted, isSaved: _isSaved } }
        } else {
            let images = (await Notes.findById(noteDocID, { content: 1 })).content
            return { ok: true, images: images }
        }
    } catch (error) {
        return { ok: false }
    }
}


export async function addSavePost({ studentDocID, noteDocID }) {
    try {
        await Students.updateOne(
            { _id: studentDocID },
            { $addToSet: { saved_notes: noteDocID } },
            { new: true }
        )
            
        return { ok: true }
    } catch (error) {
        return { ok: false }
    }
}

export async function deleteSavedPost({ studentDocID, noteDocID }) {
    try {
        await Students.updateOne(
            { _id: studentDocID },
            { $pull: { saved_notes: noteDocID } }
        )

        return { ok: true } 
    } catch (error) {
        return { ok: false }
    }
}

export async function getSavedPosts(studentID: string) {
    try {
        let student = await Students.findOne({ studentID: studentID }, { saved_notes: 1 })
        let postsIDs = student.saved_notes
        let posts: SavedNoteObject[] = await Notes.aggregate([
            { $match: { _id: { $in: postsIDs } } },
            { $project: {
                noteID: "$_id",
                noteTitle: "$title",
                noteThumbnail: { $first: '$content' },
            } }
        ])
        return { ok: true, posts }
    } catch (error) {
        return { ok: false }
    }
}


export async function searchPosts(searchTerm: string, options?: any) {
    try {
        const regex = new RegExp(searchTerm.split(' ').map(word => `(${word})`).join('.*'), 'i');
        const posts = await Notes.aggregate([
            { $match: { title: { $regex: regex }, type_: { $ne: "private" } } },
            { $project: {
                postID: "$_id",
                title: 1
            } }
        ])
        return { ok: true, posts: posts }
    } catch (error) {
        return { ok: false }
    }
}
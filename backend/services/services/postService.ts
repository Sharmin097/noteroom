import Notes, { contentsModel } from "../../schemas/notes"
import Students from "../../schemas/students"
import mongoose from "mongoose"
import { isUpVoted } from "./voteService"
import { PostType } from "../../schemas/notes"
import { deleteFile } from "./firebaseService"

interface SavedNoteObject {
    noteID: string,
    noteTitle: string,
	noteThumbnail: string
}

export async function addPost(postData: any, postType?: PostType) {
    try {
        switch (postType) {
            case PostType.CONTENT:
                const post = await contentsModel.create(postData)
                await Students.findByIdAndUpdate(
                    postData.ownerDocID,
                    { $push: { owned_notes: post._id } },
                    { upsert: true, new: true }
                )
                return { ok: true, postID: post._id }
        }
    } catch (error) {
        return { ok: false, error: error }
    }
}

export async function deletePost(postID: string, postType: PostType) {
    try {
        switch(postType) {
            case PostType.CONTENT:
                await Notes.deleteOne({ postID: postID })
                const fileDeleteResponse = await deleteFile(postID)
                return { ok: fileDeleteResponse.ok, code: !fileDeleteResponse.ok ? "FILE_DELETE_FAIL" : null } 
        }
    } catch (error) {
        return { ok: false, error: error }
    }
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
        { $match: { completed: { $eq: true }, visibility: "public" } },
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
            createdAt: 1, pinned: 1, postID: 1,
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
                    createdAt: 1, pinned: 1, postID: 1,
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
            let post = (await Notes.findById(noteDocID))?.toObject()
            if (post) {
                if (post["content"] && post["content"].length !== 0) {
                    return { ok: true, images: post["content"] }
                } else {
                    return { ok: true, images: [] }
                }
            }
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
                noteID: "$postID",
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
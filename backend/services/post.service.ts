import Notes, { contentsModel, mcqsModel, linksModel, filesModel } from "../schemas/posts.model"
import Students from "../schemas/users.model"
import mongoose from "mongoose"
import { isUpvoted } from "./vote.service"
import { PostType } from "../schemas/posts.model"
import { deleteFile } from "./firebase.service"
import { Convert } from "./user.service"

interface SavedNoteObject {
    noteID: string,
    noteTitle: string,
    noteThumbnail: string
}

export async function addPost(postData: any, postType?: PostType) {
    try {
        let post = null
        if (postType === PostType.CONTENT) {
            post = await contentsModel.create(postData)
        } else if (postType === PostType.MCQ) {
            post = await mcqsModel.create(postData)
        } else if (postType === PostType.LINK) {
            post = await linksModel.create(postData);
        } else if (postType === PostType.FILE) {
            post = await filesModel.create(postData)
        }

        if (post) {
            await Students.findByIdAndUpdate(
                postData.ownerDocID,
                { $push: { owned_notes: post._id } },
                { upsert: true, new: true }
            )
            return { ok: true, postID: post._id }
        } else {
            return { ok: false }
        }
    } catch (error) {
        return { ok: false, error: error }
    }
}

export async function deletePost(postID: string, postType: PostType) {
    try {
        if (postType === PostType.CONTENT || postType === PostType.FILE) {
            await Notes.deleteOne({ postID: postID })
            const fileDeleteResponse = await deleteFile(postID)
            return { ok: fileDeleteResponse.ok, code: !fileDeleteResponse.ok ? "FILE_DELETE_FAIL" : null }
        }
    } catch (error) {
        return { ok: false, error: error }
    }
}

export async function isSaved(userDocID: string, postDocID: string) {
    let document = await Students.findOne({
        $and:
            [
                { _id: userDocID },
                { saved_notes: { $in: [postDocID] } }
            ]
    })
    return document ? true : false
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
        { $match: { completed: { $eq: true }, visibility: "public", postType: PostType.CONTENT } },
        {
            $lookup: {
                from: 'students',
                localField: 'ownerDocID',
                foreignField: '_id',
                as: 'ownerDocID'
            }
        },
        {
            $addFields: {
                A: { $add: ["$feedbackCount", 1234567] },
                C: {
                    $add: [
                        { $multiply: [{ $add: ["$upvoteCount", 10] }, 9876543] },
                        { $multiply: [{ $add: [{ $size: "$content" }, 1] }, 22695477] }
                    ]
                }
            }
        },
        {
            $addFields: {
                randomSort: {
                    $mod: [
                        { $add: [{ $multiply: ["$A", parseInt(options.seed)] }, "$C"] },
                        Math.pow(2, 32)
                    ]
                }
            }
        },
        {
            $unwind: {
                path: '$ownerDocID',
            }
        },
        {
            $project: {
                title: 1, description: 1,
                feedbackCount: 1, upvoteCount: 1,
                postType: 1, content: 1, randomSort: 1,
                createdAt: 1, pinned: 1, postID: 1,
                "ownerDocID._id": 1,
                "ownerDocID.profile_pic": 1,
                "ownerDocID.displayname": 1,
                "ownerDocID.studentID": 1,
                "ownerDocID.username": 1
            }
        },
        {
            $addFields: {
                isOwner: { $eq: ["$ownerDocID._id", new mongoose.Types.ObjectId(studentDocID)] }
            }
        },
        { $sort: { pinned: -1, randomSort: 1 } },
        { $skip: parseInt(options.skip) },
        { $limit: parseInt(options.limit) }
    ])

    let extentedNotes = await Promise.all(
        notes.map(async (note: any) => {
            // let isupvoted = await isUpVoted({ noteDocID: note["_id"].toString(), voterStudentDocID: studentDocID })
            // let issaved = await isSaved({ noteDocID: note["_id"].toString(), studentDocID: studentDocID }) 
            return { ...note, isUpvoted: true, isSaved: true }
        })
    )

    return extentedNotes
}


//DEPRECATED
export async function getSinglePost(postID: string, studentID: string) {
    try {
        let post = await Notes.aggregate([
            { $match: { postID: postID } },
            {
                $lookup: {
                    from: 'students',
                    localField: 'ownerDocID',
                    foreignField: '_id',
                    as: 'ownerDocID'
                }
            },
            {
                $unwind: {
                    path: "$ownerDocID"
                }
            },
            {
                $project: {
                    title: 1, description: 1,
                    feedbackCount: 1, upvoteCount: 1,
                    postType: 1, content: 1,
                    createdAt: 1, pinned: 1, postID: 1,
                    "ownerDocID._id": 1,
                    "ownerDocID.profile_pic": 1,
                    "ownerDocID.displayname": 1,
                    "ownerDocID.studentID": 1,
                    "ownerDocID.username": 1
                }
            },
            {
                $addFields: {
                    isOwner: { $eq: ["$ownerDocID.studentID", studentID] }
                }
            }
        ]);

        if (post.length === 0) {
            return { ok: false }
        }

        const postDocID = post[0]._id.toString()
        const userDocID = (await Convert.getDocumentID_studentid(studentID)).toString()
        // const isPostSaved = await isSaved(userDocID, postDocID)
        const isPostUpvoted = await isUpvoted(postDocID, userDocID)

        return { ok: true, post: { ...post[0], isSaved: true, isUpvoted: isPostUpvoted } }
    } catch (error) {
        return { ok: false, error: error }
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
            {
                $project: {
                    noteID: "$postID",
                    noteTitle: "$title",
                    noteThumbnail: { $first: '$content' },
                }
            }
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
            {
                $project: {
                    postID: 1,
                    title: 1
                }
            }
        ])
        return { ok: true, posts: posts }
    } catch (error) {
        return { ok: false }
    }
}
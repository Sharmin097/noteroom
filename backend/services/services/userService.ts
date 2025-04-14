import Students from "../../schemas/students"
import mongoose from "mongoose"

export const Convert = {
    async getStudentID_username(username: string) {
        try {
            let studentID = (await Students.findOne({ username: username }, { studentID: 1 }))["studentID"]
            return studentID
        } catch (error) {
            return null
        }
    },

    async getDocumentID_studentid(studentID: string) {
        try {
            let documentID = (await Students.findOne({ studentID: studentID }, { _id: 1 }))["_id"]
            return documentID
        } catch (error) {
            return null
        }
    },

    async getUserName_studentid(studentID: string) {
        try {
            let username = (await Students.findOne({ studentID: studentID }, { username: 1 }))["username"]
            return username
        } catch (error) {
            return null
        }
    },

    async getStudentID_email(email: string) {
        try {
            let studentID = (await Students.findOne({ email: email }, { studentID: 1 }))["studentID"]
            return studentID
        } catch (error) {
            return null
        }
    },

    async getEmail_studentid(studentID: string) {
        try {
            let email = (await Students.findOne({ studentID: studentID }, { email: 1 }))["email"]
            return email
        } catch (error) {
            return null
        }
    },

    async getDisplayName_email(email: string) {
        try {
            let displayname = (await Students.findOne({ email: email }, { displayname: 1 }))["displayname"]
            return displayname
        } catch (error) {
            return null
        }
    },
    async getDocumentID_username(username: string) {
        try {
            let documentID = (await Students.findOne({ username: username }, { _id: 1 }))["_id"]
            return documentID
        } catch (error) {
            return null
        }
    }
}

export async function getProfile(username: string) {
    try {
        let student = await Students.aggregate([
            { $match: { username: username } },
            {
                $addFields: {
                    featuredNoteCount: { $size: "$featured_notes" }
                }
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "owned_notes",
                    foreignField: "_id",
                    as: "owned_posts"
                }
            },
            {
                $lookup: {
                    from: 'badges',
                    localField: 'badges',
                    foreignField: 'badgeID',
                    as: 'badges'
                }
            },
            {
                $project: {
                    _id: 0,
                    username: 1, displayname: 1, group: 1,
                    profile_pic: 1, bio: 1, collegeID: 1, collegeyear: 1,
                    favouritesubject: 1, notfavsubject: 1, featuredNoteCount: 1,
                    rollnumber: 1, badges: 1,
                    owned_posts: {
                        $map: {
                            input: "$owned_posts",
                            as: "post",
                            in: {
                                noteTitle: "$$post.title",
                                noteID: "$$post._id",
                                noteThumbnail: { $first: "$$post.content" }
                            }
                        }
                    }
                }
            }
        ])
        if (student.length === 0) return { ok: false }

        return { ok: true, student: student[0] }
    } catch (error) {
        console.log(error)
        return { ok: false }
    }
}

export async function getMutualCollegeStudents(studentDocID: string, options?: any) {
    let collegeID = (await Students.findOne({ _id: studentDocID }, { collegeID: 1 }))["collegeID"]
    if (!options) {
        let students = await Students.find({ collegeID: collegeID, visibility: "public", _id: { $ne: studentDocID } }, { profile_pic: 1, displayname: 1, bio: 1, username: 1, _id: 0, collegeID: 1 })
        return students
    } else {
        let resultCount: number | null
        if (options.countDoc) {
            resultCount = await Students.countDocuments({ collegeID: collegeID, visibility: "public", _id: { $ne: new mongoose.Types.ObjectId(studentDocID) } })
        }

        let students = await Students.aggregate([
            { $match: { collegeID: collegeID, visibility: "public", _id: { $ne: new mongoose.Types.ObjectId(studentDocID) } } },
            { $skip: options.skip },
            { $limit: options.count },
            {
                $project: {
                    profile_pic: 1,
                    displayname: 1,
                    bio: 1,
                    username: 1,
                    _id: 0,
                    collegeID: 1
                }
            }
        ])
        return { students, totalCount: resultCount }
    }
}

export async function searchStudent(searchTerm: string, options?: any) {
    const regex = new RegExp(searchTerm.split(' ').map(word => `(${word})`).join('.*'), 'i');
    if (!options) {
        let students = await Students.find({ username: { $regex: regex }, visibility: "public", onboarded: true }, { profile_pic: 1, displayname: 1, bio: 1, username: 1, _id: 0 })
        return students
    } else {
        let resultCount: number | null
        if (options.countDoc) {
            resultCount = await Students.countDocuments({ username: { $regex: regex }, visibility: "public", onboarded: true })
        }

        let students = await Students.aggregate([
            { $match: { username: { $regex: regex }, visibility: "public", onboarded: true } },
            { $skip: options.skip },
            { $limit: options.maxCount },
            {
                $project: {
                    profile_pic: 1,
                    displayname: 1,
                    bio: 1,
                    username: 1,
                    _id: 0
                }
            }
        ])
        return { students, totalCount: resultCount }
    }
}

export async function updateProfileFields(studentID: string, updates: Record<string, string>) {
    try {
        await Students.updateOne( { studentID: studentID }, updates );
        return { ok: true }
    } catch (error) {
        return { ok: false, error: error }
    }
};

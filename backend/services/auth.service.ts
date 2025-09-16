import Students from "../schemas/users.model"
import { OAuth2Client } from "google-auth-library"

export async function verifyToken(client_id: string, id_token: string) {
    const client = new OAuth2Client(client_id)
    try {
        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: client_id
        })
        return ticket.getPayload()
    } catch (error) {
        throw new Error(error)
    }
}


export async function getUserAuth(studentID_: string) {
    const context = getUserAuth.name
    try {
        const authData = await Students.findOne({ studentID: studentID_ }, { studentID: 1, username: 1, _id: 0 })
        const { studentID, username } = authData
        return { ok: true, userAuth: { studentID, username }, context }
    } catch (error) {
        return { ok: false, error: error, context }
    }
}

export async function getUserVarification(email: string) {
    const context = getUserVarification.name
    try {
        let student = await Students.findOne({ email: email })
        if (student) {
            return {
                ok: true, data: {
                    studentPass: student["password"],
                    studentID: student["studentID"],
                    username: student["username"],
                    authProvider: student["authProvider"]
                },
                context: context
            }
        } else {
            return { ok: false, code: "NO_EMAIL", context }
        }
    } catch (error) {
        return { ok: false, code: "SERVER", error: error, context }
    }
}

export async function addUserProfile(user: any) {
    const context = addUserProfile.name
    try {
        const userData = await Students.create(user)
        return { ok: true, data: userData, context }
    } catch (error) {
        return { ok: false, error: error, context }
    }
}

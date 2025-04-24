import Tokens from "../schemas/password_reset_tokens.model"
import Students from "../schemas/students.model"


interface ResetToken {
    email: string,
    reset_token: string
}

export async function addToken({ email, reset_token }: ResetToken) {
    try {
        let studentDoc = await Students.findOne({ email: email })
        if (studentDoc) {
            await Tokens.create({ email, reset_token })
            return true
        }
        return null
    } catch (error) {
        return false
    }
}

export async function getToken(reset_token: string) {
    try {
        let token_document = await Tokens.findOne({ reset_token: reset_token }, { email: 1, reset_token: 1 })
        return token_document.toObject()
    } catch (error) {
        return false
    }
}

export async function deleteToken(reset_token: string) {
    try {
        await Tokens.deleteOne({ reset_token: reset_token })
        return true
    } catch (error) {
        return false
    }
}

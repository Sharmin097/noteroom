import fileUpload from "express-fileupload"
import sharp from "sharp"
import { upload } from "./firebaseService"
import slugify from "slugify"
import {v4 as uuidv4} from "uuid"

export async function compressImage(fileObject: any) {
    try {
        let imageBuffer = fileObject.data
        let imageType: "jpeg" | "png" = fileObject.mimetype === "image/jpeg" ? "jpeg" : "png"
        let compressedBuffer = await sharp(imageBuffer)
            [imageType](
                imageType === "png" 
                ? { quality: 70, compressionLevel: 9, adaptiveFiltering: true } 
                : { quality: 70, progressive: true }
            ).toBuffer()

        return { ...fileObject, buffer: compressedBuffer, size: compressedBuffer.length }
    } catch (error) {
        return fileObject
    }
}


export async function processBulkCompressUpload(fileObjects: fileUpload.UploadedFile[], postID: string) {
    try {
        let compressedFiles = await Promise.all(fileObjects.map(fileObject => compressImage(fileObject)))
        let uploadedFiles = await Promise.all(compressedFiles.map(compressedFile => upload(compressedFile, `posts/${postID}/contents/${compressedFile["fileName"]}`)))
        return { ok: true, content: uploadedFiles }
    } catch (error) {
        return { ok: false, error: error }
    }
}

export async function processBuikPDFUpload(fileObjects: fileUpload.UploadedFile[], postID: string) {
    try {
        let files: { name: string, storageUrl: string }[] = []
        let failedUploads = []

        await Promise.all(fileObjects.map(async file => {
            const publicUrl = await upload(file, `posts/${postID}/contents/${file["fileName"]}`)
            if (publicUrl) {
                const name = file.name
                files.push({ name: name, storageUrl: publicUrl })
            } else {
                failedUploads.push(file.name)
            }
        }))

        return { ok: true, files: files, failedUploads: failedUploads }
    } catch (error) {
        return { ok: false, error: error }
    }
}


export function generateRandomUsername(displayname: string) {
    let sluggfied = slugify(displayname, {
        lower: true,
        strict: true
    })
    let uuid = uuidv4()
    let suffix = uuid.split("-")[0]
    let username = `${sluggfied}-${suffix}`

    return {
        userID: uuid,
        username: username
    }
}
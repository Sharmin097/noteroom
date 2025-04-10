import { join } from 'path';
import { config } from 'dotenv';
import firebaseAdmin from 'firebase-admin'; 
import chalk from 'chalk';

config({ path: join(__dirname, '../../../.env') });

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN === "true" ? process.env.FIREBASE_CLOUD_CRED_ADMIN! : process.env.FIREBASE_CLOUD_CRED_EMPLOYEE!);
const bucketName = process.env.DEVELOPMENT === "true" ? process.env.NOTEROOM_DEVELOPMENT_FIREBASE_BUCKET : process.env.NOTEROOM_PRODUCTION_FIREBASE_BUCKET

console.log(chalk.cyan(`[-] admin mode: ${chalk.yellow(process.env.FIREBASE_ADMIN)}`))
console.log(chalk.cyan(`[-] using firebase bucket: ${chalk.yellow(bucketName)}`))

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount), 
    storageBucket: `gs://${bucketName}`
});

let bucket = firebaseAdmin.storage().bucket();

async function uploadImage(fileObject: any, fileName: any) {
    try {
        const file = bucket.file(fileName);
        await file.save(fileObject.buffer || fileObject.data, {
            metadata: { contentType: fileObject.mimetype }
        })
        await file.makePublic();

        let publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
        return publicUrl
    } catch (error) {
        return null
    }    
}

async function deleteImage(postID: string) {
    try {
        const [files] = await bucket.getFiles({ prefix: `posts/${postID}/contents/` })
        if (files.length === 0) return { ok: true }

        const deletePromise = files.map(file => file.delete())
        await Promise.all(deletePromise)

        return { ok: true }
    } catch (error) {
        return { ok: false, error: error }
    }
}


export const upload = uploadImage;
export const deleteFile = deleteImage
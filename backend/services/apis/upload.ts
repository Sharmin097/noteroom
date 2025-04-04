import { Router } from "express";
import { Server } from "socket.io";
import { Convert } from "../services/userService";
import { addPost } from "../services/postService";
import { processBulkCompressUpload } from "../services/utils";
import Notes from "../../schemas/notes";
import logger from "../logger";
const router = Router() 

export default function uploadApiRouter(io: Server) {


    router.post("/", async (req, res) => {
        try {
            const studentID = req.session["stdid"]
            if (studentID) {
                const postSubject = req.body.postSubject
                const postTitle = req.body.postTitle
                const postDescription = req.body.postDescription

                if (!(postSubject && postTitle && postDescription)) {
                    res.json({ ok: false, message: "Please fill up all the information to publish." })
                    return
                } else {
                    logger.info(`(/upload): Got post data of studentID=${req.session["stdid"] || '--studentID--'}, postTitle=${postTitle}`)
                    const studentDocID = (await Convert.getDocumentID_studentid(studentID)).toString()
                    const files = req.files
                    try {
                        const post = await addPost({
                            ownerDocID: studentDocID,
                            subject: postSubject,
                            title: postTitle,
                            description: postDescription
                        })
                        const postID = post._id.toString()
                        logger.info(`(/upload): Saved post data of studentID=${req.session["stdid"] || '--studentID--'}, postTitle=${postTitle}, postID=${postID}`)
                        if (files) {
                            //FIXME: the bulk upload should happen asynchronously
                            const filePaths = await processBulkCompressUpload(files, postID)
                            if (filePaths) {
                                logger.info(`(/upload): Compressed files of post and updated document of studentID=${req.session["stdid"] || '--studentID--'}, postTitle=${postTitle}, postID=${postID}`)
                                await Notes.updateOne({ _id: postID }, { $set: { content: filePaths, completed: true } })
                            } 
                            res.json({ ok: true })
                        } else {
                            logger.info(`(/upload): Updated post document of studentID=${req.session["stdid"] || '--studentID--'}, postTitle=${postTitle}, postID=${postID}`)
                            await Notes.updateOne({ _id: postID }, { $set: { completed: true } })
                            res.json({ ok: true })
                        }
                    } catch (error) {
                        //TODO: the post should be deleted if the creatiion is failed
                        logger.error(`(/upload): Failed to upload post of studentID=${req.session["stdid"] || '--studentID--'}, postTitle=${postTitle}: ${error}`)
                        res.json({ ok: false, message: "Post couldn't be uploaded! Please try again a bit later or submit a report via support." })
                    }
                }
            }
        } catch (error) {
            logger.error(`(/upload): Failed to upload post of studentID=${req.session["stdid"] || '--studentID--'}: ${error}`)
            res.json({ ok: false })
        }
    })




    // Max size for each image (5MB) and max image count (5 images)
const MAX_FILE_SIZE = 5 * 1024 * 1024;  // 5MB
const MAX_FILE_COUNT = 5;  // Max 5 files

router.post("/content", async (req, res:any) => {
    try {
        const studentID = req.session["stdid"] ;
        if (!studentID) {
            return res.json({ ok: false, message: "Student ID is required." });
        }

        // Extract title, description, and files from the request
        const { postTitle, postDescription } = req.body;
        const files = req.files ? req.files.image : undefined;

        // 1. Title is required
        if (!postTitle) {
            return res.json({ ok: false, message: "Title is required." });
        }

        // 2. Description validation (optional, up to 500 characters)
        if (postDescription && postDescription.length > 500) {
            return res.json({ ok: false, message: "Description cannot exceed 500 characters." });
        }

 
        // Log the received data
        logger.info(`(/upload/content): Received post data from studentID=${studentID}, postTitle=${postTitle}`);

        // Retrieve the student document ID
        const studentDocID = (await Convert.getDocumentID_studentid(studentID)).toString();

        // Attempt to create the post in the database
        const post = await addPost({
            ownerDocID: studentDocID,
            title: postTitle,
            description: postDescription || null
        });

        const postID = post._id.toString();
        logger.info(`(/upload/content): Post saved, studentID=${studentID}, postTitle=${postTitle}, postID=${postID}`);

        if (files) {
            // 3. Image handling (validate size and quantity)
            const fileArray = Array.isArray(files) ? files : [files];
            
            if (fileArray.length > MAX_FILE_COUNT) {
                return res.json({ ok: false, message: `You can upload a maximum of ${MAX_FILE_COUNT} images.` });
            }

            // Validate each file
            for (let file of fileArray) {
                if (file.size > MAX_FILE_SIZE) {
                    return res.json({ ok: false, message: "One or more images exceed the maximum allowed size of 5MB." });
                }
                if (!file.mimetype.startsWith("image/")) {
                    return res.json({ ok: false, message: "Only image files are allowed." });
                }
            }

            // Compress and save images (you need to implement processBulkCompressUpload function)
            const filePaths = await processBulkCompressUpload(fileArray, postID);
            if (filePaths) {
                await Notes.updateOne({ _id: postID }, { $set: { content: filePaths, completed: true } });
                logger.info(`(/upload/content): Files uploaded and post updated, studentID=${studentID}, postTitle=${postTitle}, postID=${postID}`);
            }
        } else {
            // If no files, just mark as completed
            await Notes.updateOne({ _id: postID }, { $set: { completed: true } });
            logger.info(`(/upload/content): Post updated without files, studentID=${studentID}, postTitle=${postTitle}, postID=${postID}`);
        }

        res.json({ ok: true, message: "Post uploaded successfully!" });

    } catch (error) {
        logger.error(`(/upload/content): Error uploading post, studentID=${req.session["stdid"]}, error=${error}`);
        res.json({ ok: false, message: "An error occurred while uploading the post. Please try again later." });
    }
});
    

    return router
}

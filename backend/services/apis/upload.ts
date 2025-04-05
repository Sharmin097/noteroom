import { Router } from "express";
import { Server } from "socket.io";
import { Convert } from "../services/userService";
import { addPost } from "../services/postService";
import { processBulkCompressUpload } from "../services/utils";
import path from 'path';
import crypto from 'crypto';
import sanitizeHtml from 'sanitize-html';
import rateLimit from 'express-rate-limit';

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



// Configurable limits
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILE_COUNT = 5;
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

// Rate limiting to prevent excessive requests
const uploadLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Allow only 5 requests per minute
    message: "Too many requests, please try again later."
});

router.post("/content", uploadLimiter, async (req, res: any) => {
    try {
        const studentID = req.session?.['stdid']; // Secure session access

        if (!studentID) {
            return res.status(401).json({ ok: false, message: "Unauthorized. Please login." });
        }

        const { postTitle, postDescription } = req.body;
        const sanitizedTitle = sanitizeHtml(postTitle || "");
        const sanitizedDescription = sanitizeHtml(postDescription || "");

        // Validate title
        if (!sanitizedTitle || typeof sanitizedTitle !== "string" || sanitizedTitle.length > MAX_TITLE_LENGTH) {
            return res.status(400).json({
                ok: false,
                message: `Title is required, must be a string, and less than ${MAX_TITLE_LENGTH} characters.`
            });
        }

        // Validate description
        if (sanitizedDescription.length > MAX_DESCRIPTION_LENGTH) {
            return res.status(400).json({
                ok: false,
                message: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less.`
            });
        }

        logger.info(
            `(/upload/content): Received post from studentID=${encodeURIComponent(studentID)}, title=${encodeURIComponent(sanitizedTitle)}`
        );

        // Handle file uploads
        if (req.files && Object.keys(req.files).length > 0) {
            const fileArray = Object.values(req.files).flat();

            if (fileArray.length > MAX_FILE_COUNT) {
                return res.status(400).json({
                    ok: false,
                    message: `You can upload a maximum of ${MAX_FILE_COUNT} images.`
                });
            }

            for (const file of fileArray) {
                // File size validation
                if (file.size > MAX_FILE_SIZE) {
                    return res.status(400).json({
                        ok: false,
                        message: "One or more files exceed the maximum allowed size of 5MB."
                    });
                }

                // File type validation
                if (!file.mimetype.startsWith("image/")) {
                    return res.status(400).json({
                        ok: false,
                        message: "Only image files are allowed."
                    });
                }

                // Validate file extension
                const fileExtension = path.extname(file.name).toLowerCase();
                if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
                    return res.status(400).json({
                        ok: false,
                        message: `Invalid file extension. Only ${ALLOWED_EXTENSIONS.join(', ')} are allowed.`
                    });
                }

                // Sanitize file name to prevent path traversal attacks
                const sanitizedFileName = `${Date.now()}-${crypto.randomBytes(16).toString("hex")}${fileExtension}`;

                // We can now save the file to our server or cloud storage using the sanitized filename
                // Example: saveFileToStorage(sanitizedFileName, file.data);

                logger.info(`(/upload/content): File uploaded successfully for studentID=${studentID}, fileName=${sanitizedFileName}`);
            }
        } else {
            logger.info(`(/upload/content): No files uploaded, studentID=${studentID}, title=${sanitizedTitle}`);
        }

        // Save post data to your database (if applicable)

        return res.status(200).json({ ok: true, message: "Post uploaded successfully!" });
    } catch (error) {
        logger.error(`(/upload/content): Error for studentID=${req.session?.['stdid']}, error=${error}`);
        return res.status(500).json({
            ok: false,
            message: "An error occurred while uploading. Please try again later."
        });
    }
});

    

    return router
}

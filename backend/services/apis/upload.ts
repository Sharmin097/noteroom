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

// Rate limiting to prevent excessive requests
const uploadLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Allow only 5 requests per minute
    message: "Too many requests, please try again later."
});

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

    router.post("/content", uploadLimiter, async (req, res: any) => {
        // Configurable limits
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        const MAX_FILE_COUNT = 5;
        const MAX_TITLE_LENGTH = 100;
        const MAX_DESCRIPTION_LENGTH = 500;
        const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

        try {
            const studentID = req.session?.['stdid']

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

            logger.info(`(/upload/content): Received post from studentID=${encodeURIComponent(studentID)}, title=${encodeURIComponent(sanitizedTitle)}`);

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

    router.post("/mcq", uploadLimiter, async (req, res:any) => {
        // Configurable limits
        const MAX_TITLE_LENGTH = 300;
        const MAX_MCQ_LIMIT = 30;  // Limit for the number of MCQs
    
        try {
            // Get student ID from session cookie (or mock for testing purposes)
            const studentID = req.session?.['stdid'];
    
            // Ensure the student is logged in
            if (!studentID) {
                return res.status(401).json({
                    ok: false,
                    message: "Unauthorized. Please login."
                });
            }
    
            const { title, mcqs } = req.body;

            // Validate Title
            if (!title || typeof title !== "string" || title.trim() === "") {
                return res.status(400).json({
                    ok: false,
                    message: "Title is required and must be a non-empty string."
                });
            }
            
    
            // Sanitize Title (ensure no HTML tags, but don't trim the length)
            const sanitizedTitle = sanitizeHtml(title);
    
            // Validate sanitized Title length
            if (sanitizedTitle.length > MAX_TITLE_LENGTH) {
                return res.status(400).json({
                    ok: false,
                    message: `Title must be less than ${MAX_TITLE_LENGTH} characters.`
                });
            }
    
            // Validate MCQs list
            if (!Array.isArray(mcqs) || mcqs.length === 0 || mcqs.length > MAX_MCQ_LIMIT) {
                return res.status(400).json({
                    ok: false,
                    message: `MCQs are required, and the limit is ${MAX_MCQ_LIMIT} questions.`
                });
            }
    
            // Validate each MCQ object
            for (const mcq of mcqs) {
                const { question, questionID, options, correctAnswer } = mcq;
    
                // Validate question field
                if (!question || typeof question !== 'string') {
                    return res.status(400).json({ ok: false, message: "Each question must be a string." });
                }
    
                // Validate questionID field
                if (!questionID || typeof questionID !== 'string') {
                    return res.status(400).json({ ok: false, message: "Each question must have a valid questionID." });
                }
                
    
                // Validate options array and ensure there are exactly 4 options
                if (!Array.isArray(options) || options.length !== 4) {
                    return res.status(400).json({ ok: false, message: "Each MCQ must have exactly 4 options." });
                }
    
                // Validate each option
                for (const option of options) {
                    if (!option.optionType || !['A', 'B', 'C', 'D'].includes(option.optionType)) {
                        return res.status(400).json({ ok: false, message: "Each option must have a valid option type (A/B/C/D)." });
                    }
    
                    if (!option.optionText || typeof option.optionText !== 'string') {
                        return res.status(400).json({ ok: false, message: "Each option must have valid option text." });
                    }
    
                    if (!option.optionID || typeof option.optionID !== 'string') {
                        return res.status(400).json({ ok: false, message: "Each option must have a valid optionID." });
                    }
                }
    
                // Validate correct answer field
                if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
                    return res.status(400).json({ ok: false, message: "Correct answer must be one of the options (A/B/C/D)." });
                }
            }
    
            // Log sanitized title and MCQs for debugging
            logger.info(`/upload/mcq: Received MCQs from studentID=${encodeURIComponent(studentID)}, title=${encodeURIComponent(sanitizedTitle)}`);
    
            // Save the MCQ data to the database (or another storage solution)
            // Example: await saveMCQsToDB(studentID, sanitizedTitle, sanitizedMCQs);
    
            return res.status(200).json({
                ok: true,
                message: "MCQs uploaded successfully!"
            });
    
        } catch (error) {
            logger.error(`/upload/mcq: Error for studentID=${req.session?.['stdid']}, error=${error.message || error}`);
    
            return res.status(500).json({
                ok: false,
                message: "An error occurred while uploading MCQs. Please try again later."
            });
        }
    });
    // file upload and link section
    router.post("/file", uploadLimiter, async (req, res: any) => {
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        const MAX_TITLE_LENGTH = 100;
        const MAX_DESCRIPTION_LENGTH = 500;
        const ALLOWED_EXTENSIONS = [".pdf", ".docx"];
        try {
            const studentID = "1";
            if (!studentID) {
                return res.status(401).json({ ok: false, message: "Unauthorized. Please login." });
            }
            const { fileTitle, fileDescription } = req.body;
            const sanitizedTitle = sanitizeHtml(fileTitle || "").trim();
            const sanitizedDescription = sanitizeHtml(fileDescription || "").trim();
            if (!sanitizedTitle || typeof sanitizedTitle !== "string" || sanitizedTitle.length > MAX_TITLE_LENGTH) {
                return res.status(400).json({
                    ok: false,
                    message: `Title is required, must be a string, and less than ${MAX_TITLE_LENGTH} characters.`
                });
            }
            if (sanitizedDescription.length > MAX_DESCRIPTION_LENGTH) {
                return res.status(400).json({
                    ok: false,
                    message: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less.`
                });
            }
            logger.info(`(/upload/file): Received file postdata from studentID=${encodeURIComponent(studentID)}, title=${encodeURIComponent(sanitizedTitle)}`);
            if (!req.files || !req.files.file) {
                return res.status(400).json({ ok: false, message: "A file must be uploaded." });
            }
            const file = Array.isArray(req.files.file) ? req.files.file[0] : req.files.file;
            const fileExtension = path.extname(file.name).toLowerCase();
            if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
                return res.status(400).json({ ok: false, message: `Invalid file extension. Only ${ALLOWED_EXTENSIONS.join(', ')} are allowed.` });
            }
            if (file.size > MAX_FILE_SIZE) {
                return res.status(400).json({ ok: false, message: "File exceeds the maximum allowed size of 5MB." });
            }
            const sanitizedFileName = `${Date.now()}-${crypto.randomBytes(16).toString("hex")}${fileExtension}`;
            logger.info(`(/upload/file): File uploaded and metadata saved for studentID=${studentID}, fileName=${sanitizedFileName}`);
            return res.status(200).json({
                ok: true,
                message: "File uploaded successfully!",
                preview: `/preview/${sanitizedFileName}`,
                title: sanitizedTitle,
                description: sanitizedDescription
            });
        } catch (error) {
            logger.error(`(/upload/file): Error for studentID=1, error=${error}`);
            return res.status(500).json({
                ok: false,
                message: "An error occurred while uploading. Please try again later."
            });
        }
    });
     //link section
    router.post("/link", uploadLimiter, async (req, res: any) => {
        const MAX_TITLE_LENGTH = 100;
        const MAX_DESCRIPTION_LENGTH = 500;
        try {
            const studentID = "1";
            if (!studentID) {
                return res.status(401).json({ ok: false, message: "Unauthorized. Please login." });
            }
            const { postTitle, postDescription, link } = req.body;
            const sanitizedTitle = sanitizeHtml(postTitle || "").trim();
            const sanitizedDescription = sanitizeHtml(postDescription || "").trim();
            const sanitizedLink = sanitizeHtml(link || "").trim();
            if (!sanitizedTitle || typeof sanitizedTitle !== "string" || sanitizedTitle.length > MAX_TITLE_LENGTH) {
                return res.status(400).json({
                    ok: false,
                    message: `Title is required, must be a string, and less than ${MAX_TITLE_LENGTH} characters.`
                });
            }
            if (sanitizedDescription.length > MAX_DESCRIPTION_LENGTH) {
                return res.status(400).json({
                    ok: false,
                    message: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less.`
                });
            }
            if (!sanitizedLink || !/^https?:\/\//i.test(sanitizedLink)) {
                 res.status(400).json({
                    ok: false,
                    message: "A valid URL starting with http:// or https:// is required."
                });
            }
            logger.info(`(/upload/link): Link saved for studentID=1, link=${sanitizedLink}`);
             res.status(200).json({
                ok: true,
                message: "Link uploaded successfully!",
                preview: sanitizedLink,
                title: sanitizedTitle,
                description: sanitizedDescription
            });
        } catch (error) {
            logger.error(`(/upload/link): Error for studentID=1, error=${error}`);
            res.status(500).json({
                ok: false,
                message: "An error occurred while uploading the link. Please try again later."
            });
        }
    });
    return router
}

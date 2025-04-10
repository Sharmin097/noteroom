import { Router } from "express";
import { Server } from "socket.io";
import { Convert } from "../services/userService";
import { addPost, deletePost } from "../services/postService";
import path from 'path';
import crypto from 'crypto';
import sanitizeHtml from 'sanitize-html';
import rateLimit from 'express-rate-limit';
import Notes, { PostType } from "../../schemas/notes";
import logger from "../logger";
import { JSDOM } from "jsdom"
import { v4 as uuidv4 } from "uuid";
import fileUpload from "express-fileupload";
import { processBulkCompressUpload } from "../services/utils";

const router = Router()

interface ContentPost {
    ownerDocID: string,
    title: string | null,
    description? : string | null,
    content?: string[],
    postID: string
}

export default function uploadApiRouter(io: Server) {
    router.use(rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: 5, // Allow only 5 requests per minute
        message: "Too many requests, please try again later."
    }))

    router.post("/content", async (req, res: any) => {
        const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5MB
        const MAX_FILE_COUNT = 100;
        const MAX_TITLE_LENGTH = 100;
        const MAX_DESCRIPTION_LENGTH = 500;
        const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
        const postID = uuidv4()

        try {
            const studentID = req.session?.['stdid'] || "--studentid--"
            if (!studentID) return

            const { postTitle, postDescription } = req.body;
            const sanitizedTitle = sanitizeHtml(postTitle || "");
            const sanitizedDescription = sanitizeHtml(postDescription || "");
            const ownerDocID = (await Convert.getDocumentID_studentid(studentID)).toString()

            const postData: ContentPost = {
                postID: postID,
                ownerDocID: ownerDocID,
                title: null,
                description: null,
                content: []
            }

            logger.info(`(/upload/content): Got post data of studentID=${req.session["stdid"] || '--studentID--'}, postID=${postData?.postID || sanitizedTitle}`)
            let fileObjects: fileUpload.UploadedFile[] = []

            if (!sanitizedTitle || typeof sanitizedTitle !== "string" || sanitizedTitle.length > MAX_TITLE_LENGTH) {
                return res.json({
                    ok: false,
                    message: `Title is required, must be a string, and less than ${MAX_TITLE_LENGTH} characters.`
                });
            }

            if (sanitizedDescription.length > MAX_DESCRIPTION_LENGTH) {
                return res.json({
                    ok: false,
                    message: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less.`
                });
            }

            postData.title = sanitizedTitle
            postData.description = (new JSDOM(sanitizedDescription)).window.document.querySelector("p")?.textContent.trim().length !== 0 ? sanitizedDescription : null
            
            if (req.files && Object.keys(req.files).length > 0) {
                const fileArray = Object.values(req.files).flat();

                if (fileArray.length > MAX_FILE_COUNT) {
                    return res.json({
                        ok: false,
                        message: `You can upload a maximum of ${MAX_FILE_COUNT} images.`
                    });
                }

                for (const file of fileArray) {
                    if (file.size > MAX_FILE_SIZE) {
                        return res.json({
                            ok: false,
                            message: "One or more files exceed the maximum allowed size of 5MB."
                        });
                    }

                    if (!file.mimetype.startsWith("image/")) {
                        return res.json({
                            ok: false,
                            message: "Only image files are allowed."
                        });
                    }

                    const fileExtension = path.extname(file.name).toLowerCase();
                    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
                        return res.json({
                            ok: false,
                            message: `Invalid file extension. Only ${ALLOWED_EXTENSIONS.join(', ')} are allowed.`
                        });
                    }

                    const sanitizedFileName = `${Date.now()}-${crypto.randomBytes(16).toString("hex")}${fileExtension}`;
                    file["fileName"] = sanitizedFileName
                    fileObjects.push(file)

                    logger.info(`(/upload/content): File sanitized and handled successfully for studentID=${studentID}, fileName=${postData.postID + " = " + sanitizedFileName}`);
                }
            }
            
            if (fileObjects.length !== 0) {
                //FIXME: process compression-upload asynchronously. send the user "witing" confirmation and then process
                const uploadResponse = await processBulkCompressUpload(fileObjects, postData.postID)
                if (uploadResponse.ok) {
                    logger.info(`(/upload/content): Compressed files of post on firebase of studentID=${req.session["stdid"] || '--studentID--'}, postID=${postData?.postID || sanitizedTitle}`)
                    postData.content = uploadResponse.content
                } else {
                    logger.error(`(/upload/content): Couldn't compress files of post on firebase of studentID=${req.session["stdid"] || '--studentID--'}, postID=${postData?.postID || sanitizedTitle}: ${uploadResponse.error}`)
                }
            }

            const response = await addPost(postData, PostType.CONTENT)
            if (response.ok) {
                logger.info(`(/upload/content): Added post document of studentID=${req.session["stdid"] || '--studentID--'}, postID=${postData?.postID || sanitizedTitle}`)
                await Notes.updateOne({ _id: response.postID }, { completed: true })
                return res.json({ ok: true, message: "Post uploaded successfully!" })
            } else {
                await deletePost(postData.postID, PostType.CONTENT)
                logger.error(`(/upload/content): Couldn't post document of studentID=${req.session["stdid"] || '--studentID--'}, postID=${postData?.postID || sanitizedTitle}: ${response.error}`)
                return res.json({ ok: false, message: "Post couldn't get uploaded. Please try again a bit later." })
            }
        } catch (error) {
            await deletePost(postID, PostType.CONTENT)
            logger.error(`(/upload/content): Error for studentID=${req.session?.['stdid'] || "--studentid--"}: ${error}`);
            return res.json({
                ok: false,
                message: "An error occurred while uploading. Please try again later."
            });
        }
    });

    router.post("/mcq", async (req, res:any) => {
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
                return res.json({
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
    
            return res.json({
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
    

    return router
}

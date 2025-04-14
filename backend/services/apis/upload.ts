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
import { processBuikPDFUpload, processBulkCompressUpload } from "../services/utils";// Used to sanitize input to prevent XSS

const router = Router()

interface MCQ {
    question: string;
    questionID: string,
    options: {
      optionType: string,
      optionText: string,
      optionID: string
    }[],
    correctAnswer: string | null;
}

interface PostData {
    ownerDocID: string,
    postID: string,
    title: string,
    description?: string
}

interface LinkPostData {
    postID: string;
    ownerDocID: string;
    title: string;
    link: string;
  }

export default function uploadApiRouter(io: Server) {
    router.use(rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: 5, // Allow only 5 requests per minute
        message: "Too many requests, please try again later."
    }))

    const isValidUrl = (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    };    

    router.post("/content", async (req, res: any) => {
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
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

            const postData: PostData & { content?: string[] } = {
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
        const MAX_TITLE_LENGTH = 300;
        const MAX_MCQ_LIMIT = 30; 
        const OPTIONS_LENGTH = 4;
        const postID = uuidv4()
    
        try {
            const studentID = req.session?.['stdid'];    
            if (!studentID) return
    
            const { postTitle: title, mcqStrings } = req.body;
            const mcqs = JSON.parse(mcqStrings)
            const ownerDocID = (await Convert.getDocumentID_studentid(studentID)).toString()

            if (!title || typeof title !== "string" || title.trim() === "") {
                return res.json({
                    ok: false,
                    message: "Title is required and must be a non-empty string."
                });
            }
                
            const sanitizedTitle = sanitizeHtml(title);    
            if (sanitizedTitle.length > MAX_TITLE_LENGTH) {
                return res.json({
                    ok: false,
                    message: `Title must be less than ${MAX_TITLE_LENGTH} characters.`
                });
            }
    
            if (!Array.isArray(mcqs) || mcqs.length === 0 || mcqs.length > MAX_MCQ_LIMIT) {
                return res.json({
                    ok: false,
                    message: `MCQs are required, and the limit is ${MAX_MCQ_LIMIT} questions.`
                });
            }
    
            for (const mcq of mcqs) {
                const { question, options, correctAnswer } = mcq;
    
                if (!question || typeof question !== 'string') {
                    return res.json({ ok: false, message: "Each question must be a string." });
                }
                    
                if (!Array.isArray(options) || options.length !== OPTIONS_LENGTH) {
                    return res.json({ ok: false, message: "Each MCQ must have exactly 4 options." });
                }
    
                for (const option of options) {
                    if (!option.optionType || !['A', 'B', 'C', 'D'].includes(option.optionType)) {
                        return res.json({ ok: false, message: "Each option must have a valid option type (A/B/C/D)." });
                    }
    
                    if (!option.optionText || typeof option.optionText !== 'string') {
                        return res.json({ ok: false, message: "Each option must have valid option text." });
                    }
                }
    
                if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
                    return res.json({ ok: false, message: "Correct answer must be one of the options (A/B/C/D)." });
                }

            }
    
            logger.info(`/upload/mcq: Received MCQs from studentID=${encodeURIComponent(studentID)}, title=${encodeURIComponent(sanitizedTitle)}`);

            const modifiedMQCs = mcqs.map((mcq: MCQ) => {
                const questionID = `${Date.now()}-${crypto.randomBytes(16).toString("hex")}`
                const options = mcq.options.map(option => {
                    const optionID = `${option.optionType}:${questionID}`
                    return { ...option, optionID: optionID }
                })
                return { ...mcq, questionID: questionID, options: options }
            })

            const postData: PostData & { mcqs: MCQ[] } = {
                postID: postID,
                ownerDocID: ownerDocID,
                mcqs: modifiedMQCs,
                title: sanitizedTitle
            }
            const response = await addPost(postData, PostType.MCQ)

            if (response.ok) {
                return res.json({
                    ok: true,
                    message: "MCQs uploaded successfully!"
                });
            } else {
                return res.json({
                    ok: false,
                    message: "MCQs couldn't be uploaded successfully! Try again a bit later"
                });
            }
        } catch (error) {
            logger.error(`/upload/mcq: Error for studentID=${req.session?.['stdid']}, error=${error.message || error}`);
    
            return res.json({
                ok: false,
                message: "An error occurred while uploading MCQs. Please try again later."
            });
        }
    });

    router.post("/file", async (req, res: any) => {
        // FIXME: add a delete post when upload fails (@rafi)
        const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
        const MAX_FILES = 5;
        const MAX_TITLE_LENGTH = 100;
        const MAX_DESCRIPTION_LENGTH = 500;
        const ALLOWED_EXTENSIONS = [".pdf"];
        const postID = uuidv4()
    
        const studentID = req.session?.["stdid"]
    
        try {
            if (!studentID) {
                logger.error(`(/upload/file): Missing studentID in session.`)
                return res.status(400).json({ ok: false, message: "Invalid student ID." });
            }
    
            const { postTitle: title, postDescription: description } = req.body;
            const sanitizedTitle = sanitizeHtml(title || "").trim();
            const sanitizedDescription = sanitizeHtml(description || "").trim();
            const ownerDocID = (await Convert.getDocumentID_studentid(studentID)).toString()
    
            const postData: { files: { name: string, storageUrl: string }[] } & PostData = {
                postID: postID,
                description: null,
                ownerDocID: ownerDocID,
                title: null,
                files: []
            }
    
            logger.info(`(/upload/file): Received post data for studentID=${studentID}, postID=${postID}`)
    
            if (!sanitizedTitle || typeof sanitizedTitle !== "string" || sanitizedTitle.length > MAX_TITLE_LENGTH) {
                logger.error(`(/upload/file): Invalid title from studentID=${studentID}`)
                return res.json({
                    ok: false,
                    message: `Title is required, must be a string, and less than ${MAX_TITLE_LENGTH} characters.`,
                });
            }
    
            if (sanitizedDescription.length > MAX_DESCRIPTION_LENGTH) {
                logger.error(`(/upload/file): Description too long from studentID=${studentID}`)
                return res.json({
                    ok: false,
                    message: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less.`,
                });
            }
            
            let fileObjects: fileUpload.UploadedFile[] = []
            postData.description = (new JSDOM(sanitizedDescription)).window.document.querySelector("p")?.textContent.trim().length !== 0 ? sanitizedDescription : null
            postData.title = sanitizedTitle
    
            if (!req.files || Object.keys(req.files).length === 0) {
                logger.error(`(/upload/file): No files uploaded by studentID=${studentID}`)
                return res.json({
                    ok: false,
                    message: "At least one file needs to be selected"
                })
            }
    
            const uploadedFiles = Object.values(req.files).flat()
    
            if (uploadedFiles.length > MAX_FILES) {
                logger.error(`(/upload/file): Too many files uploaded by studentID=${studentID}`)
                return res.json({
                    ok: false,
                    message: `You can only upload up to ${MAX_FILES} files at a time.`,
                });
            }
    
            for (const file of uploadedFiles) {
                const fileExtension = path.extname(file.name).toLowerCase();
    
                if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
                    logger.error(`(/upload/file): Invalid file extension (${fileExtension}) by studentID=${studentID}`)
                    return res.json({
                        ok: false,
                        message: `Invalid file extension. Only ${ALLOWED_EXTENSIONS.join(", ")} are allowed.`,
                    });
                }
    
                if (file.size > MAX_FILE_SIZE) {
                    logger.error(`(/upload/file): File too large by studentID=${studentID}`)
                    return res.json({
                        ok: false,
                        message: "File exceeds the maximum allowed size of 5GB.",
                    });
                }
    
                const sanitizedFileName = `${Date.now()}-${crypto.randomBytes(16).toString("hex")}${fileExtension}`;
                file["fileName"] = sanitizedFileName
                fileObjects.push(file)
    
                logger.info(`(/upload/file): File sanitized successfully for studentID=${studentID}, fileName=${postID + " = " + sanitizedFileName}`)
            }
    
            const uploadResponse = await processBuikPDFUpload(fileObjects, postID)
            if (uploadResponse.ok) {
                const files = uploadResponse.files
                postData.files = files
    
                logger.info(`(/upload/file): Files uploaded to storage for studentID=${studentID}, postID=${postID}`)
    
                const response = await addPost(postData, PostType.FILE)
                if (response.ok) {
                    await Notes.updateOne({ _id: response.postID }, { completed: true })
                    logger.info(`(/upload/file): Post document created for studentID=${studentID}, postID=${postID}`)
                    return res.json({ ok: true, message: "Files posted successfully." });
                } else {
                    logger.error(`(/upload/file): Failed to create post document for studentID=${studentID}, postID=${postID}: ${response.error}`)
                    return res.json({ ok: false, message: "Files cannot be posted successfully. Please try again a bit later!" });
                }
            } else {
                logger.error(`(/upload/file): Failed to upload files to storage for studentID=${studentID}, postID=${postID}: ${uploadResponse.error}`)
                return res.json({ ok: false, message: "Files cannot be posted successfully. Please try again a bit later!" });
            }
    
        } catch (error) {
            logger.error(`(/upload/file): Error for studentID=${studentID}, error=${error}`);
            return res.json({
                ok: false,
                message: "An error occurred while uploading. Please try again later.",
            });
        }
    });
    
    
    router.post("/link", async (req, res:any) => {
        const MAX_TITLE_LENGTH = 100;
        const postID = uuidv4();
    
        try {
            const studentID = req.session?.['stdid']
            if (!studentID) return
    
            const { postTitle, linksString } = req.body;
            const links: string[] = JSON.parse(linksString || "[]")
            const sanitizedTitle = sanitizeHtml(postTitle || "").trim();
            const ownerDocID = (await Convert.getDocumentID_studentid(studentID)).toString();
    
            const postData: { links: string[] } & PostData = {
                postID: postID,
                ownerDocID: ownerDocID,
                title: null,
                links: [] 
            };
    
            if (links.length === 0) {
                return res.json({
                    ok: false,
                    message: "Valid HTTP or HTTPS link(s) is required."
                });
            }

            logger.info(`(/upload/link): Received post for studentID=${studentID}, postID=${postID}`);
    
            if (!sanitizedTitle || typeof sanitizedTitle !== "string" || sanitizedTitle.length > MAX_TITLE_LENGTH) {
                return res.json({
                    ok: false,
                    message: `Title is required, must be a string, and less than ${MAX_TITLE_LENGTH} characters.`
                });
            }
    
            postData.title = sanitizedTitle;

            for (const link of links) {
                const sanitizedLink = sanitizeHtml(link || "").trim().toLowerCase();

                if (!sanitizedLink || typeof sanitizedLink !== "string" || !/^https?:\/\//.test(sanitizedLink) || !isValidUrl(sanitizedLink) ) {
                    return res.json({
                        ok: false,
                        message: "Valid HTTP or HTTPS link(s) is required."
                    });
                }
            }

            postData.links = links
    
            const response = await addPost(postData, PostType.LINK);
            if (response.ok) {
                logger.info(`(/upload/link): Post saved for studentID=${req.session["stdid"] || '--studentID--'}, postID=${postID}`);
                return res.json({ ok: true, message: "Link post uploaded successfully!" });
            } else {
                logger.error(`(/upload/link): Failed to add post for studentID=${req.session["stdid"] || '--studentID--'}: ${response.error}`);
                return res.json({
                    ok: false,
                    message: "Post couldn't be uploaded. Please try again later."
                });
            }
    
        } catch (error) {
            logger.error(`(/upload/link): Exception for studentID==${req.session["stdid"] || '--studentID--'}: ${error}`);
            return res.json({
                ok: false,
                message: "An error occurred while uploading. Please try again later."
            });
        }
    });
    
    
    
 
  

    
    return router
}

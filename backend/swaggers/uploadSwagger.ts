/**
 * @swagger
 * tags:
 *   - name: "Upload"
 *     description: "Endpoints related to upload functionality"
 */



/**
 * @swagger
 * /api/upload:
 *   post:
 *     tags:
 *       - "Upload"
 *     summary: Upload a post
 *     description: Upload a post to Noteroom without title or description.
 *     responses:
 *       200:
 *         description: Successful upload
 */

/**
 * @swagger
 * /api/upload/content:
 *   post:
 *     tags:
 *       - "Upload"
 *     summary: Upload a post with title, description, and image
 *     description: Upload a post containing title, description, and an image.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Post uploaded successfully
 */


/**
 * @swagger
 * /api/upload/mcq:
 *   post:
 *     tags:
 *       - "Upload"
 *     summary: Upload MCQs for a student
 *     description: Uploads a set of multiple choice questions for a specific student.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentID:
 *                 type: string
 *                 description: The ID of the logged-in student.
 *               title:
 *                 type: string
 *                 description: The title of the MCQ quiz.
 *               mcqs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     question_id:
 *                       type: string
 *                       description: The unique identifier for the question.
 *                     question_text:
 *                       type: string
 *                       description: The question text.
 *                     options:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           option_id:
 *                             type: string
 *                             description: The unique identifier for the option.
 *                           option_text:
 *                             type: string
 *                             description: The text of the option.
 *                           option_type:
 *                             type: string
 *                             enum: [A, B, C, D]
 *                             description: The type of the option (A/B/C/D).
 *                     correct_answer:
 *                       type: string
 *                       enum: [A, B, C, D]
 *                       description: The correct answer (A/B/C/D).
 *     responses:
 *       200:
 *         description: Successfully uploaded MCQs.
 *       400:
 *         description: Bad request (missing required fields or invalid data).
 */


/**
 * @swagger
 * /api/upload/file:
 *   post:
 *     summary: Upload up to 5 PDF files with title and description
 *     tags:
 *       - Upload
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               postTitle:
 *                 type: string
 *                 description: Title of the post (max 100 chars)
 *               postDescription:
 *                 type: string
 *                 description: Optional description (max 500 chars)
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Up to 5 PDF files (max 5GB each)
 *     responses:
 *       200:
 *         description: Result of the upload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *               example:
 *                 ok: true
 *                 message: "Files posted successfully."
 */


/**
 * @swagger
 * /api/upload/link:
 *   post:
 *     summary: Submit a post with external HTTP/HTTPS links
 *     tags:
 *       - Upload
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               postTitle:
 *                 type: string
 *                 description: Title of the post (max 100 chars)
 *               linksString:
 *                 type: string
 *                 description: JSON string of link array (e.g. ["https://example.com"])
 *     responses:
 *       200:
 *         description: Result of the upload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *               example:
 *                 ok: true
 *                 message: "Link post uploaded successfully!"
 */

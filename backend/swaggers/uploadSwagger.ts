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

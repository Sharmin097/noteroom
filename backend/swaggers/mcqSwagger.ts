/**
 * @swagger
 * tags:
 *   - name: "MCQ Voting"
 *     description: "Operations related to MCQ Votes"
 */



/**
 * @swagger
 * /api/mcq/vote:
 *   post:
 *     summary: Submit or change a student's vote for a multiple-choice question
 *     tags:
 *       - MCQ Voting
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionID
 *               - studentID
 *               - optionID
 *             properties:
 *               questionID:
 *                 type: string
 *                 description: ID of the MCQ question
 *                 example: "q123"
 *               studentID:
 *                 type: string
 *                 description: Unique ID of the student
 *                 example: "s456"
 *               optionID:
 *                 type: string
 *                 description: The option selected in the format "<option>:<questionID>"
 *                 example: "A:q123"
 *     responses:
 *       200:
 *         description: Vote submitted or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request due to missing or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error while processing the vote
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 */

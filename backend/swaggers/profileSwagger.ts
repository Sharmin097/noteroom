/**
 * @swagger
 * tags:
 *   - name: "Profile"
 *     description: "User profile related operations"
 */

/**
 * @swagger
 * /api/users/{username}:
 *   get:
 *     summary: Get user profile data excluding owned posts
 *     tags:
 *       - Profile
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username of the user
 *     responses:
 *       200:
 *         description: Successfully fetched user profile
 */

/**
 * @swagger
 * /api/users/mutual-college:
 *   get:
 *     summary: Get mutual college student profiles
 *     tags:
 *       - Profile
 *     responses:
 *       200:
 *         description: Successfully fetched mutual college students
 */

/**
 * @swagger
 * /api/users/{username}/posts/owned:
 *   get:
 *     summary: Get owned posts of a user
 *     tags:
 *       - Profile
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username of the user
 *     responses:
 *       200:
 *         description: Successfully fetched owned posts
 */


/**
 * @swagger
 * /api/users/change:
 *   post:
 *     summary: Change student profile fields
 *     tags:
 *       - Profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - group
 *             properties:
 *               displayname:
 *                 type: string
 *                 description: Display name of the student
 *               bio:
 *                 type: string
 *                 description: Short bio or introduction
 *               rollnumber:
 *                 type: string
 *                 description: Student's roll number
 *               favouritesubject:
 *                 type: string
 *                 description: Student's favorite subject
 *               notfavsubject:
 *                 type: string
 *                 description: Student's least favorite subject
 *               group:
 *                 type: string
 *                 enum: [Science, Commerce, Arts]
 *                 description: Academic group of the student
 *               collegeyear:
 *                 type: string
 *                 description: Current academic year of the student
 *     responses:
 *       200:
 *         description: Profile update success or failure message
 */

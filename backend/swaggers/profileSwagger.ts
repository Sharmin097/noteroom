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

/**
 * @swagger
 * tags:
 *   - name: "Auth"
 *     description: "Endpoints related to login functionality"
 */



/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - "Auth"
 *     summary: Login user
 *     responses:
 *       200:
 *         description: Successful login
 */

/**
 * @swagger
 * /api/auth/session:
 *   get:
 *     tags:
 *       - "Auth"
 *     summary: Get the user auth data when the page reloads
 *     responses:
 *       200:
 *         description: Successful response with auth data
 */


/**
 * @swagger
 * /auth/google:
 *   post:
 *     tags:
 *       - "Auth"
 *     summary: Google login and user registration
 *     description: Authenticate users via Google ID token and either login or register the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               credential:
 *                 type: string
 *                 description: ID token from Google authentication.
 *                 example: "YOUR_GOOGLE_ID_TOKEN"
 *     responses:
 *       200:
 *         description: Successful login or user registration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 userAuth:
 *                   type: object
 *                   properties:
 *                     studentID:
 *                       type: string
 *                       example: "student123"
 *                     username:
 *                       type: string
 *                       example: "john_doe"
 *       400:
 *         description: Bad Request (missing credential or wrong login provider)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "This email is registered with another method. Try normal login."
 *       401:
 *         description: Unauthorized (email not verified or token expired)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Email is not verified by Google."
 *       500:
 *         description: Internal Server Error (issue with user creation)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Something went wrong while creating your account."
 */
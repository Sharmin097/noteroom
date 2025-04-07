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

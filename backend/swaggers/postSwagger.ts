/**
 * @swagger
 * tags:
 *   - name: "Post"
 *     description: "Operations related to posts"
 */

/**
 * @swagger
 * /api/posts/{postID}/metadata:
 *   get:
 *     summary: Get post data excluding images
 *     tags:
 *       - Post
 *     parameters:
 *       - in: path
 *         name: postID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *     responses:
 *       200:
 *         description: Successfully fetched post metadata
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /api/posts/{postID}/images:
 *   get:
 *     summary: Get images of the post
 *     tags:
 *       - Post
 *     parameters:
 *       - in: path
 *         name: postID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *     responses:
 *       200:
 *         description: Successfully fetched post images
 */

/**
 * @swagger
 * /api/posts/{postID}/comments:
 *   get:
 *     summary: Get comments of a post
 *     tags:
 *       - Post
 *     parameters:
 *       - in: path
 *         name: postID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *     responses:
 *       200:
 *         description: Successfully fetched post comments
 */

/**
 * @swagger
 * /api/posts/{postID}/feedbacks:
 *   post:
 *     summary: Post feedback to a post
 *     tags:
 *       - Post
 *     parameters:
 *       - in: path
 *         name: postID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *     responses:
 *       201:
 *         description: Feedback posted successfully
 */

/**
 * @swagger
 * /api/posts/{postID}/feedbacks/{feedbackID}/replies:
 *   post:
 *     summary: Post a reply to feedback in a post
 *     tags:
 *       - Post
 *     parameters:
 *       - in: path
 *         name: postID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *       - in: path
 *         name: feedbackID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the feedback
 *     responses:
 *       201:
 *         description: Successfully posted a reply to feedback
 */

/**
 * @swagger
 * /api/posts/{postID}/save:
 *   post:
 *     summary: Save/unsave a post
 *     tags:
 *       - Post
 *     parameters:
 *       - in: path
 *         name: postID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *     responses:
 *       200:
 *         description: Successfully saved/unsaved the post
 */

/**
 * @swagger
 * /api/posts/{postID}/vote:
 *   post:
 *     summary: Vote/unvote a post
 *     tags:
 *       - Post
 *     parameters:
 *       - in: path
 *         name: postID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *     responses:
 *       200:
 *         description: Successfully voted/unvoted the post
 */

/**
 * @swagger
 * /api/posts/{postID}/feedbacks/{feedbackID}/vote:
 *   post:
 *     summary: Vote/unvote a feedback
 *     tags:
 *       - Post
 *     parameters:
 *       - in: path
 *         name: postID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *       - in: path
 *         name: feedbackID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the feedback
 *     responses:
 *       200:
 *         description: Successfully voted/unvoted the feedback
 */

/**
 * @swagger
 * /api/posts/{postID}:
 *   delete:
 *     summary: Delete a post from the noteroom
 *     tags:
 *       - Post
 *     parameters:
 *       - in: path
 *         name: postID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to delete
 *     responses:
 *       200:
 *         description: Successfully deleted the post
 */

/**
 * @swagger
 * /api/posts/save:
 *   get:
 *     summary: Get all saved posts of the logged-in user
 *     description: This endpoint retrieves all the posts that the current logged-in user has saved.
 *     tags:
 *       - Post
 *     responses:
 *       200:
 *         description: Successfully fetched saved posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   postID:
 *                     type: string
 *                     description: ID of the saved post
 *                   title:
 *                     type: string
 *                     description: Title of the saved post
 *                   description:
 *                     type: string
 *                     description: Description of the saved post
 *                   image:
 *                     type: string
 *                     description: Image URL of the saved post (if any)
 *       401:
 *         description: Unauthorized if the user is not logged in
 *       500:
 *         description: Internal server error
 */

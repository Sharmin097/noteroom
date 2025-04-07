/**
 * @swagger
 * tags:
 *   - name: "Logged in user - Notification"
 *     description: "Notification-related endpoints for logged in user"
 *   - name: "Logged in user - Saved Notes"
 *     description: "Saved notes/posts for logged in user"
 *   - name: "Logged in user - Request"
 *     description: "Friend/follow request endpoints for logged in user"
 */


/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags:
 *       - Logged in user - Notification
 *     summary: Get notifications of the current logged-in user
 *     description: Retrieves all notifications for the currently authenticated user.
 *     responses:
 *       200:
 *         description: Successfully fetched notifications
 */


/**
 * @swagger
 * /api/notifications:
 *   delete:
 *     tags:
 *       - Logged in user - Notification
 *     summary: Delete all notifications
 *     description: Deletes all notifications for the currently authenticated user.
 *     responses:
 *       200:
 *         description: Successfully deleted all notifications
 */



/**
 * @swagger
 * /api/notifications/{notificationID}:
 *   delete:
 *     tags:
 *       - Logged in user - Notification
 *     summary: Delete a notification
 *     parameters:
 *       - name: notificationID
 *         in: path
 *         required: true
 *         description: The ID of the notification
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response after deleting the notification
 */

/**
 * @swagger
 * /api/notifications/{notificationID}/read:
 *   post:
 *     tags:
 *       - Logged in user - Notification
 *     summary: Mark a notification as read
 *     parameters:
 *       - name: notificationID
 *         in: path
 *         required: true
 *         description: The ID of the notification
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response after marking notification as read
 */

/**
 * @swagger
 * /api/notifications/read:
 *   post:
 *     tags:
 *       - Logged in user - Notification
 *     summary: Mark all notifications as read
 *     responses:
 *       200:
 *         description: Successful response after marking all notifications as read
 */





/**
 * @swagger
 * /api/posts/saved:
 *   get:
 *     tags:
 *       - Logged in user - Saved Notes
 *     summary: Get saved posts of a logged in user
 *     responses:
 *       200:
 *         description: Successful response with saved posts
 */




/**
 * @swagger
 * /api/requests:
 *   get:
 *     tags:
 *       - Logged in user - Request
 *     summary: Get requests of a logged in user
 *     responses:
 *       200:
 *         description: Successful response with requests
 */

/**
 * @swagger
 * /api/requests/send:
 *   post:
 *     tags:
 *       - Logged in user - Request
 *     summary: Send a request to a user
 *     responses:
 *       200:
 *         description: Successful response after sending the request
 */

/**
 * @swagger
 * /api/requests/{requestID}/accept:
 *   post:
 *     tags:
 *       - Logged in user - Request
 *     summary: Accept a request of a user
 *     parameters:
 *       - name: requestID
 *         in: path
 *         required: true
 *         description: The ID of the request
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response after accepting the request
 */

/**
 * @swagger
 * /api/requests/{requestID}/decline:
 *   post:
 *     tags:
 *       - Logged in user - Request
 *     summary: Decline a request of a user
 *     parameters:
 *       - name: requestID
 *         in: path
 *         required: true
 *         description: The ID of the request
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response after declining the request
 */




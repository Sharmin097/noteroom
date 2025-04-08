/**
 * @swagger
 * tags:
 *   - name: "Search"
 *     description: "Endpoints related to search functionality"
 */

/**
 * @swagger
 * /api/search:
 *   get:
 *     tags:
 *       - "Search"
 *     summary: Searching profiles, communities, posts and all using search queries
 *     parameters:
 *       - name: query
 *         in: query
 *         required: true
 *         description: The search query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response with search results
 */
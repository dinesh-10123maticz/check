/**
 * @swagger
 * tags:
 *   - name: Sync
 *     description: Client data sync for planets, asteroids, ships & crews (/v1/nft/sync)
 */

/**
 * @swagger
 * /v1/nft/sync/planets:
 *   post:
 *     summary: Sync planets (with metadata)
 *     tags: [Sync]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Planets synced
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/nft/sync/asteroids:
 *   post:
 *     summary: Sync asteroids
 *     tags: [Sync]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Asteroids synced
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/nft/sync/ships:
 *   post:
 *     summary: Sync ships
 *     tags: [Sync]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Ships synced
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/nft/sync/crews:
 *   post:
 *     summary: Sync crews
 *     tags: [Sync]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Crews synced
 *       '401':
 *         description: Missing/invalid token
 */

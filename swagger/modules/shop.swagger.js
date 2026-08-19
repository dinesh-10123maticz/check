/**
 * @swagger
 * tags:
 *   - name: Shop
 *     description: In-game market shop — planets, ships, crew, price conversion (/v1/shop)
 */

/**
 * @swagger
 * /v1/shop/planetastroid:
 *   post:
 *     summary: Planet/asteroid shop listing
 *     tags: [Shop]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Shop data fetched
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/shop/types:
 *   get:
 *     summary: Get game market collections
 *     tags: [Shop]
 *     responses:
 *       '200':
 *         description: Collections fetched
 */

/**
 * @swagger
 * /v1/shop/ship:
 *   post:
 *     summary: Ship market shop listing
 *     tags: [Shop]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Ships fetched
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/shop/galficrew:
 *   post:
 *     summary: Galfi crew market listing
 *     tags: [Shop]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Crew fetched
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/shop/crew:
 *   post:
 *     summary: Crew market listing
 *     tags: [Shop]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Crew fetched
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/shop/galfispecialcrew:
 *   post:
 *     summary: Special crew market listing
 *     tags: [Shop]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Special crew fetched
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/shop/search:
 *   post:
 *     summary: Search the shop
 *     tags: [Shop]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Search results
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/shop/category:
 *   get:
 *     summary: Shop categories
 *     tags: [Shop]
 *     responses:
 *       '200':
 *         description: Categories fetched
 */

/**
 * @swagger
 * /v1/shop/galfipriceforship:
 *   post:
 *     summary: Get GALFI price for a ship
 *     tags: [Shop]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shipId: { type: string }
 *               price: { type: number }
 *               optionalCost: { type: number }
 *     responses:
 *       '200':
 *         description: Price fetched
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/shop/galfipriceforBuilding:
 *   post:
 *     summary: Get GALFI price for a building
 *     tags: [Shop]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assetId: { type: string }
 *               level: { type: number }
 *     responses:
 *       '200':
 *         description: Price fetched
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/shop/admin/ship:
 *   get:
 *     summary: Ship market listing (admin)
 *     tags: [Shop]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Ships fetched
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/shop/admin/editshipprice:
 *   post:
 *     summary: Edit ship price (admin)
 *     tags: [Shop]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shipId: { type: string }
 *     responses:
 *       '200':
 *         description: Ship price updated
 *       '422':
 *         description: Invalid/missing token
 */

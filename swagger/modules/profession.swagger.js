/**
 * @swagger
 * tags:
 *   - name: Profession
 *     description: Crew professions & their bonuses (/v1/profession)
 */

/**
 * @swagger
 * /v1/profession:
 *   post:
 *     summary: Create a profession
 *     tags: [Profession]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [symbol, profession, baseCost]
 *             properties:
 *               symbol: { type: string }
 *               profession: { type: string }
 *               baseContribution:
 *                 type: object
 *                 properties:
 *                   exploration: { type: number }
 *                   science: { type: number }
 *                   social: { type: number }
 *                   combat: { type: number }
 *               baseCost: { type: number }
 *               rewardModifiers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     appliesTo: { type: string }
 *                     target: { type: string }
 *                     condition: { type: string }
 *                     valueType: { type: string, enum: [PERCENT, FLAT] }
 *                     value: { type: number }
 *                     description: { type: string }
 *               notes: { type: string }
 *               isActive: { type: boolean }
 *     responses:
 *       '201':
 *         description: Profession created
 *       '400':
 *         description: Validation error
 *   get:
 *     summary: List all professions (with crew counts)
 *     tags: [Profession]
 *     responses:
 *       '200':
 *         description: Professions fetched
 */

/**
 * @swagger
 * /v1/profession/id/{id}:
 *   get:
 *     summary: Get profession by id
 *     tags: [Profession]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '200':
 *         description: Profession fetched
 *       '404':
 *         description: Profession not found
 */

/**
 * @swagger
 * /v1/profession/key/{key}:
 *   get:
 *     summary: Get profession by key (game engine)
 *     tags: [Profession]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '200':
 *         description: Profession fetched
 *       '404':
 *         description: Profession not found
 */

/**
 * @swagger
 * /v1/profession/{id}:
 *   put:
 *     summary: Update a profession
 *     tags: [Profession]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Profession updated
 *       '400':
 *         description: Validation error
 */

/**
 * @swagger
 * /v1/profession/{key}:
 *   delete:
 *     summary: Soft-delete a profession by key
 *     tags: [Profession]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '200':
 *         description: Profession deactivated
 *       '400':
 *         description: Error
 */

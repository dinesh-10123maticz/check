/**
 * @swagger
 * tags:
 *   - name: Missions
 *     description: Game missions — explore, mining, combat, social, rewards (/v1/mission)
 */

/**
 * @swagger
 * /v1/mission/admin/creatmissionreward:
 *   post:
 *     summary: Create a mission reward (admin)
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Reward created
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/mission/admin/missionreward:
 *   put:
 *     summary: Update a mission reward (admin)
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id: { type: string }
 *               explore: { type: number }
 *               combat: { type: number }
 *               mining: { type: number }
 *               social: { type: number }
 *     responses:
 *       '200':
 *         description: Reward updated
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/mission/admin/missionreward/{id}:
 *   delete:
 *     summary: Delete a mission reward (admin)
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '200':
 *         description: Reward deleted
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/mission/admin/missionrewardlist:
 *   get:
 *     summary: List mission rewards
 *     tags: [Missions]
 *     responses:
 *       '200':
 *         description: Rewards fetched
 */

/**
 * @swagger
 * /v1/mission/missioncrew:
 *   post:
 *     summary: Get crew list for missions
 *     tags: [Missions]
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
 * /v1/mission/missionstatus:
 *   get:
 *     summary: Get mission status (pending / claimed / not claimed)
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Mission status fetched
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/mission/v2/claim/reward:
 *   post:
 *     summary: Claim mission reward (v2)
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Reward claimed
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/mission/v3/missionstatus:
 *   get:
 *     summary: Get mission status (v3, by type)
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *     responses:
 *       '200':
 *         description: Mission status fetched
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/mission/v3/missionhistory:
 *   get:
 *     summary: Get mission history (v3)
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Mission history fetched
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/mission/v3/missionstatus/details/{missionStatsId}:
 *   get:
 *     summary: Get mission status details
 *     tags: [Missions]
 *     parameters:
 *       - in: path
 *         name: missionStatsId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '200':
 *         description: Mission details fetched
 */

/**
 * @swagger
 * /v1/mission/ship/jump:
 *   post:
 *     summary: Jump ship between hexes
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string, description: "Encrypted payload (decryptGameRequest)" }
 *     responses:
 *       '200':
 *         description: Ship jumped
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/mission/v3/explore/start:
 *   post:
 *     summary: Start an exploration mission
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string, description: "Encrypted payload { nearByPlanetId, userShipId, crew, scope, missiontype }" }
 *     responses:
 *       '200':
 *         description: Mission started
 *       '400':
 *         description: Validation error
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/mission/v3/mining/start:
 *   post:
 *     summary: Start a mining mission
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string, description: "Encrypted payload { nearByPlanetId, userShipId, crew, scope, missiontype }" }
 *     responses:
 *       '200':
 *         description: Mission started
 *       '400':
 *         description: Validation error
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/mission/v3/combat/start:
 *   post:
 *     summary: Start a combat mission
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string, description: "Encrypted payload { nearByPlanetId, userShipId, crew, scope, missiontype }" }
 *     responses:
 *       '200':
 *         description: Mission started
 *       '400':
 *         description: Validation error
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/mission/v3/social/start:
 *   post:
 *     summary: Start a social mission
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string, description: "Encrypted payload { nearByPlanetId, userShipId, crew, scope, missiontype }" }
 *     responses:
 *       '200':
 *         description: Mission started
 *       '400':
 *         description: Validation error
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/mission/nearbyPlanets/{userplanetId}:
 *   get:
 *     summary: Get nearby planets for a user planet
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: userplanetId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '200':
 *         description: Nearby planets fetched
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/mission/hex:
 *   get:
 *     summary: Get planets for a hex id
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: hexId
 *         schema: { type: string }
 *     responses:
 *       '200':
 *         description: Hex planets fetched
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/mission/getMissionStats:
 *   get:
 *     summary: Get mission stats
 *     tags: [Missions]
 *     responses:
 *       '200':
 *         description: Mission stats fetched
 */

/**
 * @swagger
 * /v1/mission/missionscope:
 *   get:
 *     summary: Get mission scope / game values
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Game values fetched
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/mission/admin/missionbonusreward:
 *   get:
 *     summary: Get mission bonus rewards (admin)
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Bonus rewards fetched
 *       '422':
 *         description: Invalid/missing token
 *   put:
 *     summary: Update mission bonus rewards (admin)
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Bonus rewards updated
 *       '400':
 *         description: Validation error
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/mission/nearbyplanetstatus:
 *   get:
 *     summary: Get nearby planet status
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Nearby planet status fetched
 *       '401':
 *         description: Missing/invalid token
 */

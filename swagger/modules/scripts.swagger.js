/**
 * @swagger
 * tags:
 *   - name: Scripts
 *     description: DB seeding & migration utilities (DEV only) (/v1/script)
 */

/**
 * @swagger
 * /v1/script/create_nearby_planet:
 *   post:
 *     summary: Create nearby planets for every hex
 *     tags: [Scripts]
 *     description: Seeding utility — iterate hex IDs and generate nearby exploration planets. Run once per universe.
 *     responses:
 *       '200':
 *         description: Nearby planets created
 */

/**
 * @swagger
 * /v1/script/autoinsertplanetorastroid:
 *   post:
 *     summary: Bulk insert planets & asteroids
 *     tags: [Scripts]
 *     description: Generates planet + asteroid datasets with rarity tiers. Running twice may duplicate assets.
 *     responses:
 *       '200':
 *         description: Assets inserted
 */

/**
 * @swagger
 * /v1/script/autoinsertshipasset:
 *   post:
 *     summary: Bulk insert ship assets
 *     tags: [Scripts]
 *     responses:
 *       '200':
 *         description: Ships inserted
 */

/**
 * @swagger
 * /v1/script/crewInsert:
 *   post:
 *     summary: Generate male crew NFT entries
 *     tags: [Scripts]
 *     responses:
 *       '200':
 *         description: Crew inserted
 */

/**
 * @swagger
 * /v1/script/insertProfessions:
 *   post:
 *     summary: Insert/update profession master data
 *     tags: [Scripts]
 *     description: Idempotent UPSERT of professions.
 *     responses:
 *       '200':
 *         description: Professions inserted
 */

/**
 * @swagger
 * /v1/script/createspecialcrew:
 *   post:
 *     summary: Create special crew NFT collections
 *     tags: [Scripts]
 *     responses:
 *       '200':
 *         description: Special crew created
 */

/**
 * @swagger
 * /v1/script/mission_reward_db_entry:
 *   post:
 *     summary: Insert mission reward DB entries
 *     tags: [Scripts]
 *     description: Restricted from production (restrictProduction).
 *     responses:
 *       '200':
 *         description: Mission rewards inserted
 *       '403':
 *         description: Restricted in production
 */

/**
 * @swagger
 * /v1/script/currencycontractchange:
 *   put:
 *     summary: Change currency contract address
 *     tags: [Scripts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Contract address changed
 */

/**
 * @swagger
 * /v1/script/assignCrewToPlanets:
 *   post:
 *     summary: Assign crew to planets and asteroids
 *     tags: [Scripts]
 *     description: Assigns a free crew member for each purchased planet/asteroid.
 *     responses:
 *       '200':
 *         description: Crew assigned
 */

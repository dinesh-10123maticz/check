/**
 * @swagger
 * tags:
 *   - name: Game
 *     description: Game engine — IPFS, planets, asteroids, ships, crew, buildings, training & inventory (/v1/game)
 */

/**
 * @swagger
 * /v1/game/uploadimage:
 *   post:
 *     summary: Upload an image (generic)
 *     tags: [Game]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               location: { type: string }
 *               fileName: { type: string }
 *               image: { type: string, format: binary }
 *     responses:
 *       '200':
 *         description: Image uploaded
 */

/**
 * @swagger
 * /v1/game/initipfs:
 *   post:
 *     summary: Initialize IPFS upload
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: IPFS initialized
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/game/ipfs/planetAsteroidType:
 *   get:
 *     summary: Get planet/asteroid asset types
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Assets fetched
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/game/ipfs/planet:
 *   post:
 *     summary: IPFS upload for planet
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planetId: { type: string }
 *     responses:
 *       '200':
 *         description: Uploaded
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/game/ipfs/asteroid:
 *   post:
 *     summary: IPFS upload for asteroid
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userPlanetId: { type: string }
 *     responses:
 *       '200':
 *         description: Uploaded
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/game/ipfs/ship:
 *   post:
 *     summary: IPFS upload for ship
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Uploaded
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/game/initipfsforcrew:
 *   post:
 *     summary: Initialize IPFS for crew
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Initialized
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/game/ipfs/crew:
 *   post:
 *     summary: IPFS upload for crew
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               crewId: { type: string }
 *     responses:
 *       '200':
 *         description: Uploaded
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/game/ipfs/specialcrew:
 *   post:
 *     summary: IPFS upload for special crew
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type: { type: string }
 *               hexId: { type: number }
 *     responses:
 *       '200':
 *         description: Uploaded
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/game/nft/gameinfo:
 *   post:
 *     summary: Get game info for an NFT
 *     tags: [Game]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Game info fetched
 */

/**
 * @swagger
 * /v1/game/assetbyplanetid:
 *   post:
 *     summary: Get assets by planet id
 *     tags: [Game]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Assets fetched
 */

/**
 * @swagger
 * /v1/game/assetshop:
 *   post:
 *     summary: Asset shop listing
 *     tags: [Game]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Shop assets fetched
 */

/**
 * @swagger
 * /v1/game/createuserasset:
 *   post:
 *     summary: Buy a building (create user asset)
 *     tags: [Game]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               build_Number: { type: string }
 *               planetId: { type: string }
 *               nextLevelId: { type: string }
 *               pricetype: { type: string }
 *               optionalCost: { type: number }
 *     responses:
 *       '200':
 *         description: Asset created
 */

/**
 * @swagger
 * /v1/game/userassetlist:
 *   get:
 *     summary: List user assets
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: userPlanetId
 *         schema: { type: string }
 *     responses:
 *       '200':
 *         description: Assets fetched
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/game/planetlist:
 *   get:
 *     summary: List planets
 *     tags: [Game]
 *     responses:
 *       '200':
 *         description: Planets fetched
 */

/**
 * @swagger
 * /v1/game/userassetlevelup:
 *   post:
 *     summary: Level up a user asset
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               walletAddress: { type: string }
 *               planetId: { type: string }
 *     responses:
 *       '200':
 *         description: Asset leveled up
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/game/claimreward:
 *   post:
 *     summary: Claim building reward
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               build_Number: { type: string }
 *     responses:
 *       '200':
 *         description: Reward claimed
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/game/useconsumable:
 *   post:
 *     summary: Use a consumable
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               build_Number: { type: string }
 *               days: { type: number }
 *     responses:
 *       '200':
 *         description: Consumable used
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/game/claimallreward:
 *   post:
 *     summary: Claim all building rewards
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userPlanetId: { type: string }
 *     responses:
 *       '200':
 *         description: Rewards claimed
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/game/planetrewards:
 *   get:
 *     summary: Get planet rewards
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Rewards fetched
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/game/shipshop:
 *   get:
 *     summary: Get ship shop
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Ship shop fetched
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/game/shiplist:
 *   get:
 *     summary: List all ships
 *     tags: [Game]
 *     responses:
 *       '200':
 *         description: Ships fetched
 */

/**
 * @swagger
 * /v1/game/shipformission:
 *   post:
 *     summary: Assign ship for a mission
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Ship assigned
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/game/ship/admin/update:
 *   put:
 *     summary: Update ship (admin)
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Ship updated
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/game/ship/admin/update/price:
 *   put:
 *     summary: Update ship price (admin)
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Ship price updated
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/game/training/add:
 *   post:
 *     summary: Add crew training
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Training added
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/game/training/claim:
 *   post:
 *     summary: Claim trained crew
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Crew claimed
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/game/training:
 *   get:
 *     summary: Get training crew
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Training crew fetched
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/game/pack:
 *   post:
 *     summary: Create a pack
 *     tags: [Game]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Pack created
 *   get:
 *     summary: Get packs
 *     tags: [Game]
 *     responses:
 *       '200':
 *         description: Packs fetched
 */

/**
 * @swagger
 * /v1/game/add/pack:
 *   post:
 *     summary: Add pack to asset
 *     tags: [Game]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Pack added
 */

/**
 * @swagger
 * /v1/game/update/pack/planetassets:
 *   post:
 *     summary: Update pack for planet/asteroid assets
 *     tags: [Game]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Pack updated
 */

/**
 * @swagger
 * /v1/game/crew/{id}:
 *   get:
 *     summary: Get crew by id
 *     tags: [Game]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '200':
 *         description: Crew fetched
 */

/**
 * @swagger
 * /v1/game/crew/addcrew:
 *   post:
 *     summary: Add a crew NFT asset
 *     tags: [Game]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Crew added
 */

/**
 * @swagger
 * /v1/game/userinventory:
 *   post:
 *     summary: Get user inventory
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Inventory fetched
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/game/moveinventory:
 *   post:
 *     summary: Move inventory item
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Inventory moved
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/game/isquote:
 *   put:
 *     summary: Mark quote as read
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Updated
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/game/equipship:
 *   post:
 *     summary: Equip a ship
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Ship equipped
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/game/getbackship:
 *   post:
 *     summary: Unequip / get back ship
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Ship retrieved
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/game/admin/assetsforairdrop:
 *   post:
 *     summary: Fetch assets for airdrop (admin)
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Assets fetched
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/game/v2/admin/crew/price:
 *   put:
 *     summary: Update crew price (admin)
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Crew price updated
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/game/admin/crew/price:
 *   get:
 *     summary: Get crew price (admin)
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Crew price fetched
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/game/admin/planet/price:
 *   put:
 *     summary: Update planet/asteroid price (admin)
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Price updated
 *       '422':
 *         description: Invalid/missing token
 *   get:
 *     summary: Get planet/asteroid price (admin)
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Price fetched
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/game/buildinglist:
 *   get:
 *     summary: List buildings (user)
 *     tags: [Game]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Buildings fetched
 *       '401':
 *         description: Missing/invalid token
 */

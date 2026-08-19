/**
 * @swagger
 * tags:
 *   - name: Exchange
 *     description: Token staking pools, stacking, claiming & withdrawals (/v1/exchange)
 */

/**
 * @swagger
 * /v1/exchange/stack:
 *   post:
 *     summary: Stack tokens
 *     tags: [Exchange]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [poolId, amount]
 *             properties:
 *               poolId: { type: string }
 *               amount: { type: number }
 *     responses:
 *       '200':
 *         description: Tokens stacked
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/exchange/stacktoken:
 *   post:
 *     summary: Stack tokens (validated)
 *     tags: [Exchange]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [poolId, amount]
 *             properties:
 *               poolId: { type: string }
 *               amount: { type: number }
 *     responses:
 *       '200':
 *         description: Tokens stacked
 *       '400':
 *         description: Validation error
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/exchange/claimstackedtoken:
 *   post:
 *     summary: Claim stacked tokens
 *     tags: [Exchange]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tokenStakeId: { type: string }
 *     responses:
 *       '200':
 *         description: Tokens claimed
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/exchange/stakedtokendetails:
 *   get:
 *     summary: Get staked token details
 *     tags: [Exchange]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Stake details fetched
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/exchange/getclaim:
 *   post:
 *     summary: Get claimable amount
 *     tags: [Exchange]
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
 *         description: Claimable amount fetched
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/exchange/withdraw:
 *   post:
 *     summary: Withdraw balance
 *     tags: [Exchange]
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
 *         description: Withdrawal processed
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/exchange/tokenpoollist:
 *   get:
 *     summary: List token pools (public)
 *     tags: [Exchange]
 *     responses:
 *       '200':
 *         description: Token pools fetched
 */

/**
 * @swagger
 * /v1/exchange/admin/tokenpoollist:
 *   get:
 *     summary: List token pools (admin)
 *     tags: [Exchange]
 *     responses:
 *       '200':
 *         description: Token pools fetched
 */

/**
 * @swagger
 * /v1/exchange/admin/tokenpoolstatus:
 *   post:
 *     summary: Change token pool status
 *     tags: [Exchange]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id: { type: string }
 *     responses:
 *       '200':
 *         description: Status changed
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/exchange/admin/createtokenpool:
 *   post:
 *     summary: Create a token pool
 *     tags: [Exchange]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, lockedPeriod, rewardPercent, stakeCurrencyId, rewardCurrencyId]
 *             properties:
 *               name: { type: string }
 *               imageUrl: { type: string }
 *               lockedPeriod: { type: number, description: "in days" }
 *               rewardPercent: { type: number }
 *               stakeCurrencyId: { type: string }
 *               rewardCurrencyId: { type: string }
 *     responses:
 *       '200':
 *         description: Token pool created
 *       '400':
 *         description: Validation error
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/exchange/admin/updatetokenpool:
 *   post:
 *     summary: Update a token pool
 *     tags: [Exchange]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [_id]
 *             properties:
 *               _id: { type: string }
 *               name: { type: string }
 *               lockedPeriod: { type: number }
 *               rewardPercent: { type: number }
 *               stakeCurrencyId: { type: string }
 *               rewardCurrencyId: { type: string }
 *     responses:
 *       '200':
 *         description: Token pool updated
 *       '400':
 *         description: Validation error
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/exchange/admin/transcation:
 *   get:
 *     summary: List transactions
 *     tags: [Exchange]
 *     responses:
 *       '200':
 *         description: Transactions fetched
 */

/**
 * @swagger
 * /v1/exchange/convert/price:
 *   post:
 *     summary: Convert price between currencies
 *     tags: [Exchange]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usd: { type: number }
 *               assetType: { type: string }
 *     responses:
 *       '200':
 *         description: Converted price
 */

/**
 * @swagger
 * /v1/exchange/dev/updatemoney:
 *   post:
 *     summary: Update user balance (DEV only)
 *     tags: [Exchange]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Balance updated
 */

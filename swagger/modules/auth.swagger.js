/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Wallet-based user registration, login & token issuance (/v1/user)
 *   - name: Users
 *     description: User profile, follow, newsletter, balances & deposits (/v1/user)
 */

/**
 * @swagger
 * /v1/user/create:
 *   post:
 *     summary: Register a user profile (NFT marketplace)
 *     tags: [Authentication]
 *     description: Creates a user profile with a wallet address and returns a JWT. Request body is AES-encrypted by DecryptDatas middleware.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               WalletAddress: { type: string, description: "User's wallet address" }
 *               WalletType: { type: string, description: "Wallet type (e.g. metamask)" }
 *               EmailId: { type: string }
 *               DisplayName: { type: string }
 *               Youtube: { type: string }
 *               Facebook: { type: string }
 *               Twitter: { type: string }
 *               Instagram: { type: string }
 *               Bio: { type: string }
 *               CustomUrl: { type: string }
 *               image_key: { type: string }
 *     responses:
 *       '201':
 *         description: Profile created — encrypted payload { status, data, token, usercuurency, message }
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/EncryptedResponse' }
 *       '409':
 *         description: Display name or custom URL already exists
 *       '400':
 *         description: Could not create profile
 */

/**
 * @swagger
 * /v1/user/connect:
 *   post:
 *     summary: Login / connect wallet (NFT marketplace)
 *     tags: [Authentication]
 *     description: Returns existing user + JWT if the wallet is known, otherwise creates the wallet user and returns a new JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [WalletAddress]
 *             properties:
 *               WalletAddress: { type: string }
 *     responses:
 *       '200':
 *         description: Wallet already connected (token returned)
 *       '201':
 *         description: Wallet created and connected (token returned)
 */

/**
 * @swagger
 * /v1/user/creategameuser:
 *   post:
 *     summary: Create / login a game user
 *     tags: [Authentication]
 *     description: Creates a game user (or logs in an existing one) and returns a JWT. Supports referral codes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refferalByCode: { type: string }
 *               Type: { type: string }
 *               WalletAddress: { type: string }
 *               WalletType: { type: string }
 *               EmailId: { type: string }
 *               DisplayName: { type: string }
 *               imageKey: { type: string }
 *               Youtube: { type: string }
 *               Facebook: { type: string }
 *               Twitter: { type: string }
 *               Instagram: { type: string }
 *               Bio: { type: string }
 *               CustomUrl: { type: string }
 *     responses:
 *       '200':
 *         description: Existing wallet user logged in (token returned)
 *       '201':
 *         description: Game user created (token returned)
 *       '400':
 *         description: Display name too short / invalid referral code
 */

/**
 * @swagger
 * /v1/user/gameconnect:
 *   post:
 *     summary: Login / connect wallet (game client)
 *     tags: [Authentication]
 *     description: Game-client wallet login. Returns user data, JWT token and off-chain currency balances.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [WalletAddress, time]
 *             properties:
 *               WalletAddress: { type: string }
 *               time: { type: number, description: "Client timestamp (ms). Rejected if older than 30 minutes" }
 *     responses:
 *       '200':
 *         description: Connected successfully (token + currency data returned)
 *       '400':
 *         description: Account blocked/suspended, or session expired
 */

/**
 * @swagger
 * /v1/user/v2/gameconnect:
 *   post:
 *     summary: Login / connect wallet (game client, encrypted payload)
 *     tags: [Authentication]
 *     description: Same as /gameconnect but the body is wrapped in an encrypted `token` field (decryptGameRequest).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string, description: "Encrypted payload containing WalletAddress and time" }
 *     responses:
 *       '200':
 *         description: Connected successfully
 *       '400':
 *         description: Invalid/expired payload
 */

/**
 * @swagger
 * /v1/user/edit:
 *   post:
 *     summary: Edit profile (NFT marketplace)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               WalletAddress: { type: string }
 *               EmailId: { type: string }
 *               DisplayName: { type: string }
 *               Youtube: { type: string }
 *               Facebook: { type: string }
 *               Twitter: { type: string }
 *               Instagram: { type: string }
 *               Bio: { type: string }
 *               CustomUrl: { type: string }
 *               Profile: { type: string }
 *               Cover: { type: string }
 *     responses:
 *       '200':
 *         description: Profile updated
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/user/editgameuser:
 *   post:
 *     summary: Edit game user profile
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               EmailId: { type: string }
 *               DisplayName: { type: string }
 *               Youtube: { type: string }
 *               Facebook: { type: string }
 *               Twitter: { type: string }
 *               Instagram: { type: string }
 *               Bio: { type: string }
 *               imageKey: { type: string }
 *               customUrl: { type: string }
 *     responses:
 *       '201':
 *         description: Profile updated (token returned)
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/user/getprofile/{CustomUrl}:
 *   get:
 *     summary: Get public profile by custom URL
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: CustomUrl
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '200':
 *         description: Profile fetched
 */

/**
 * @swagger
 * /v1/user/gameuserprofile:
 *   get:
 *     summary: Get authenticated game user profile (with mission stats)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Profile + mission counts fetched
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/user/FollowUnFollow:
 *   post:
 *     summary: Follow or unfollow another user
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               MyItemAddr: { type: string }
 *               ClickAddr: { type: string }
 *               MyItemCustomUrl: { type: string }
 *               ClickCustomUrl: { type: string }
 *     responses:
 *       '200':
 *         description: "Returns 'follow' or 'unfollow'"
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/user/notification:
 *   get:
 *     summary: Get user notifications (recent activity)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: address
 *         schema: { type: string }
 *         description: Wallet address
 *       - in: query
 *         name: skip
 *         schema: { type: integer }
 *         description: Pagination skip
 *     responses:
 *       '200':
 *         description: Notifications fetched
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/user/profileimage:
 *   put:
 *     summary: Upload/update profile image
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               WalletAddress: { type: string }
 *               Profile: { type: string, format: binary }
 *               Cover: { type: string, format: binary }
 *     responses:
 *       '201':
 *         description: Profile image updated
 *       '409':
 *         description: Update failed
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/user/coverimage:
 *   put:
 *     summary: Upload/update cover image
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               WalletAddress: { type: string }
 *               Profile: { type: string, format: binary }
 *               Cover: { type: string, format: binary }
 *     responses:
 *       '200':
 *         description: Cover image updated
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/user/getbalance:
 *   get:
 *     summary: Get wallet balance (off-chain + on-chain)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: walletAddress
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: network
 *         schema: { type: string }
 *         description: Network key (e.g. sepolia, polygon)
 *     responses:
 *       '200':
 *         description: Balances fetched
 *       '404':
 *         description: Please create profile
 */

/**
 * @swagger
 * /v1/user/addbalance:
 *   post:
 *     summary: Add off-chain balance for a currency
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               walletAddress: { type: string }
 *               stacked: { type: number }
 *               currencyId: { type: string }
 *               balance: { type: number }
 *     responses:
 *       '200':
 *         description: Balance updated
 *       '404':
 *         description: No currency available
 */

/**
 * @swagger
 * /v1/user/depositebalance:
 *   post:
 *     summary: Deposit balance from an on-chain transaction
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [walletAddress, tokenName, amount, transactionHash]
 *             properties:
 *               walletAddress: { type: string }
 *               tokenName: { type: string }
 *               amount: { type: number }
 *               transactionHash: { type: string }
 *     responses:
 *       '200':
 *         description: Deposit recorded
 *       '400':
 *         description: Missing fields or transaction failed
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/user/isTutorialPlayed:
 *   put:
 *     summary: Mark tutorial as played
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Updated
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/user/claimfreereward:
 *   post:
 *     summary: Claim the free NFT reward
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Claimed
 *       '401':
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /v1/user/newsletter:
 *   post:
 *     summary: Subscribe email to newsletter
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string }
 *     responses:
 *       '201':
 *         description: Subscribed
 *       '409':
 *         description: Email already exists
 */

/**
 * @swagger
 * /v1/user/deletewithwalletaddress:
 *   post:
 *     summary: Delete all user data by wallet address (DEV only)
 *     tags: [Users]
 *     description: Development endpoint — deletes user assets, planets and user record.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               walletAddress: { type: string }
 *     responses:
 *       '200':
 *         description: Deleted
 *       '404':
 *         description: User not found
 */

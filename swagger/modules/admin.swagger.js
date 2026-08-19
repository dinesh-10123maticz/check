/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Admin authentication, users, game settings & dashboard (/v1/admin)
 */

/**
 * @swagger
 * /v1/admin/adminlogin:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     description: "Returns a JWT to use as `Authorization: Bearer <token>` on admin endpoints."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       '200':
 *         description: Logged in — { status, message, data, token }
 *       '400':
 *         description: Incorrect password / user not found
 */

/**
 * @swagger
 * /v1/admin/getForgotPasswordOTP:
 *   post:
 *     summary: Request a forgot-password OTP
 *     tags: [Admin]
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
 *       '200':
 *         description: OTP sent
 *       '404':
 *         description: Admin not found
 *       '400':
 *         description: Email is required
 *   put:
 *     summary: Reset password using OTP
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp, newPassword, confirmNewPassword]
 *             properties:
 *               email: { type: string }
 *               otp: { type: string }
 *               newPassword: { type: string }
 *               confirmNewPassword: { type: string }
 *     responses:
 *       '200':
 *         description: Password updated
 *       '400':
 *         description: Invalid/expired OTP or mismatched passwords
 *       '404':
 *         description: Admin not found
 */

/**
 * @swagger
 * /v1/admin/userlist:
 *   get:
 *     summary: List all users
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: User list fetched (encrypted)
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/admin/updateuserstatus:
 *   post:
 *     summary: Block or activate a user
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, blockedStatus]
 *             properties:
 *               userId: { type: string }
 *               blockedStatus: { type: string, enum: [active, blocked] }
 *     responses:
 *       '200':
 *         description: Status updated
 *       '400':
 *         description: Invalid status
 *       '404':
 *         description: User not found
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/admin/userdetail:
 *   post:
 *     summary: Get user detail by id
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id: { type: string }
 *     responses:
 *       '200':
 *         description: User detail fetched
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/admin/banuser:
 *   put:
 *     summary: Ban a user
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id: { type: string }
 *               status: { type: boolean }
 *     responses:
 *       '200':
 *         description: User banned
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/admin/gamevalue:
 *   put:
 *     summary: Update game values
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id: { type: string }
 *               rewardTimes: { type: number }
 *               missionReward: { type: array, items: { type: object } }
 *               refferal_Percent: { type: number }
 *               consumabelTimes: { type: number }
 *     responses:
 *       '200':
 *         description: Updated
 *       '422':
 *         description: Invalid/missing token
 *   get:
 *     summary: Get game values
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Game values fetched
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/admin/creategamevalue:
 *   post:
 *     summary: Create game values (once)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Created
 *       '400':
 *         description: Game value already exists
 */

/**
 * @swagger
 * /v1/admin/buildings:
 *   get:
 *     summary: List game buildings
 *     tags: [Admin]
 *     responses:
 *       '200':
 *         description: Buildings fetched
 */

/**
 * @swagger
 * /v1/admin/build_time:
 *   put:
 *     summary: Edit building build time / level limit
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id: { type: string }
 *               build_Time_in_min: { type: number, nullable: true }
 *               levelLimit: { type: number, nullable: true }
 *               buildLocationType: { type: string, enum: [planet, asteroid, all], nullable: true }
 *     responses:
 *       '200':
 *         description: Updated
 *       '400':
 *         description: Validation error
 *       '404':
 *         description: Asset not found
 */

/**
 * @swagger
 * /v1/admin/missionplanet-limit:
 *   put:
 *     summary: Update mission planet limit
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rarity: { type: string }
 *               limit: { type: number }
 *     responses:
 *       '200':
 *         description: Updated
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/admin/gamesetting-mission-time:
 *   put:
 *     summary: Update mission time settings
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id: { type: string }
 *               mission_min: { type: number }
 *               rewardTimes: { type: number }
 *               xpmin: { type: number }
 *               xpmax: { type: number }
 *     responses:
 *       '200':
 *         description: Updated
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/admin/gamesetting:
 *   put:
 *     summary: Update game settings
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GameSetting'
 *     responses:
 *       '200':
 *         description: Updated
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/admin/updategamesetting:
 *   put:
 *     summary: Update game settings (full payload)
 *     tags: [Admin]
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
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/admin/addMissionRewards:
 *   put:
 *     summary: Add a mission reward
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               missionReward: { type: object }
 *     responses:
 *       '200':
 *         description: Mission reward added
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/admin/deleteMissionRewards:
 *   delete:
 *     summary: Delete a mission reward
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '200':
 *         description: Mission reward deleted
 *       '400':
 *         description: id is required
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/admin/getMissionRewards:
 *   get:
 *     summary: Get mission rewards
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema: { type: string }
 *         description: Optional single reward id
 *     responses:
 *       '200':
 *         description: Mission rewards fetched
 *       '404':
 *         description: Not found
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/admin/updateCrewCost:
 *   put:
 *     summary: Update crew NFT cost (profession)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nftCost]
 *             properties:
 *               nftCost: { type: number }
 *               id: { type: string }
 *     responses:
 *       '200':
 *         description: Cost updated
 *       '400':
 *         description: nftCost is required
 *       '404':
 *         description: Profession not found
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/admin/getDashboardData:
 *   get:
 *     summary: Get admin dashboard stats
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Dashboard data fetched
 *       '422':
 *         description: Invalid/missing token
 */

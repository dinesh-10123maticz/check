/**
 * @swagger
 * tags:
 *   - name: Promotion
 *     description: Blogs, news, partners & promotional content (/v1/promo)
 */

/**
 * @swagger
 * /v1/promo/blog/{id}:
 *   get:
 *     summary: Get a blog post
 *     tags: [Promotion]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '200':
 *         description: Blog fetched
 */

/**
 * @swagger
 * /v1/promo/news/{id}:
 *   get:
 *     summary: Get a news item
 *     tags: [Promotion]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '200':
 *         description: News fetched
 */

/**
 * @swagger
 * /v1/promo/createnews:
 *   post:
 *     summary: Create a news item (admin)
 *     tags: [Promotion]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrl: { type: string }
 *               videoUrl: { type: string }
 *               heading: { type: string }
 *               description: { type: string }
 *               navLink: { type: string }
 *     responses:
 *       '200':
 *         description: News created
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/promo/updatenews:
 *   put:
 *     summary: Update a news item (admin)
 *     tags: [Promotion]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id: { type: string }
 *               imageUrl: { type: string }
 *               heading: { type: string }
 *               description: { type: string }
 *               navLink: { type: string }
 *     responses:
 *       '200':
 *         description: News updated
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/promo/newslist:
 *   get:
 *     summary: List news (public)
 *     tags: [Promotion]
 *     responses:
 *       '200':
 *         description: News fetched
 */

/**
 * @swagger
 * /v1/promo/adminnewslist:
 *   get:
 *     summary: List news (admin)
 *     tags: [Promotion]
 *     responses:
 *       '200':
 *         description: News fetched
 */

/**
 * @swagger
 * /v1/promo/adminbloglist:
 *   get:
 *     summary: List blogs (admin)
 *     tags: [Promotion]
 *     responses:
 *       '200':
 *         description: Blogs fetched
 */

/**
 * @swagger
 * /v1/promo/news:
 *   delete:
 *     summary: Delete a news item (admin)
 *     tags: [Promotion]
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
 *         description: News deleted
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/promo/blog:
 *   delete:
 *     summary: Delete a blog (admin)
 *     tags: [Promotion]
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
 *         description: Blog deleted
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/promo/newsstatus:
 *   put:
 *     summary: Toggle news status
 *     tags: [Promotion]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Status changed
 */

/**
 * @swagger
 * /v1/promo/createblog:
 *   post:
 *     summary: Create a blog (admin)
 *     tags: [Promotion]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrl: { type: string }
 *               heading: { type: string }
 *               description: { type: string }
 *     responses:
 *       '200':
 *         description: Blog created
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/promo/updateblog:
 *   put:
 *     summary: Update a blog (admin)
 *     tags: [Promotion]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id: { type: string }
 *               imageUrl: { type: string }
 *               heading: { type: string }
 *               description: { type: string }
 *     responses:
 *       '200':
 *         description: Blog updated
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/promo/bloglist:
 *   get:
 *     summary: List blogs
 *     tags: [Promotion]
 *     responses:
 *       '200':
 *         description: Blogs fetched
 */

/**
 * @swagger
 * /v1/promo/bloglists:
 *   get:
 *     summary: List blogs for the site
 *     tags: [Promotion]
 *     responses:
 *       '200':
 *         description: Blogs fetched
 */

/**
 * @swagger
 * /v1/promo/blogstatus:
 *   put:
 *     summary: Toggle blog status
 *     tags: [Promotion]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Status changed
 */

/**
 * @swagger
 * /v1/promo/partnerlist:
 *   get:
 *     summary: List partners
 *     tags: [Promotion]
 *     responses:
 *       '200':
 *         description: Partners fetched
 */

/**
 * @swagger
 * /v1/promo/partner:
 *   delete:
 *     summary: Delete a partner (admin)
 *     tags: [Promotion]
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
 *         description: Partner deleted
 *       '422':
 *         description: Invalid/missing token
 *   post:
 *     summary: Create a partner (admin)
 *     tags: [Promotion]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName: { type: string }
 *               image: { type: string }
 *               navLink: { type: string }
 *     responses:
 *       '200':
 *         description: Partner created
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/promo/promocms:
 *   get:
 *     summary: Get promo CMS content
 *     tags: [Promotion]
 *     responses:
 *       '200':
 *         description: CMS content fetched
 */

/**
 * @swagger
 * /v1/promo/promobuild:
 *   get:
 *     summary: List promo buildings
 *     tags: [Promotion]
 *     responses:
 *       '200':
 *         description: Buildings fetched
 *   delete:
 *     summary: Delete a promo building (admin)
 *     tags: [Promotion]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Building deleted
 *       '422':
 *         description: Invalid/missing token
 *   post:
 *     summary: Create a promo building (admin)
 *     tags: [Promotion]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               buildingName: { type: string }
 *               description: { type: string }
 *               image: { type: string }
 *     responses:
 *       '200':
 *         description: Building created
 *       '422':
 *         description: Invalid/missing token
 *   put:
 *     summary: Update a promo building (admin)
 *     tags: [Promotion]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Building updated
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/promo/publish:
 *   post:
 *     summary: Create a publish entry (admin)
 *     tags: [Promotion]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName: { type: string }
 *               image: { type: string }
 *               navLink: { type: string }
 *     responses:
 *       '200':
 *         description: Publish entry created
 *       '422':
 *         description: Invalid/missing token
 *   put:
 *     summary: Update a publish entry (admin)
 *     tags: [Promotion]
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
 *         description: Publish entry updated
 *       '422':
 *         description: Invalid/missing token
 *   get:
 *     summary: List publish entries
 *     tags: [Promotion]
 *     responses:
 *       '200':
 *         description: Publish entries fetched
 *   delete:
 *     summary: Delete a publish entry (admin)
 *     tags: [Promotion]
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
 *         description: Publish entry deleted
 *       '422':
 *         description: Invalid/missing token
 */

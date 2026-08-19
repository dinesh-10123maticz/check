/**
 * @swagger
 * tags:
 *   - name: CMS
 *     description: Content management — FAQ, roadmap, currencies, collections & social (/v1/cms)
 *   - name: Uploads
 *     description: File / video upload endpoints
 */

/**
 * @swagger
 * /v1/cms/uploadvideo:
 *   post:
 *     summary: Upload a video
 *     tags: [Uploads]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [location, video]
 *             properties:
 *               location: { type: string, description: "S3 prefix/path" }
 *               video: { type: string, format: binary }
 *     responses:
 *       '200':
 *         description: Uploaded
 *       '400':
 *         description: Upload failed
 */

/**
 * @swagger
 * /v1/cms/faqlists:
 *   get:
 *     summary: List FAQs
 *     tags: [CMS]
 *     responses:
 *       '200':
 *         description: FAQs fetched
 */

/**
 * @swagger
 * /v1/cms/updatefaq:
 *   put:
 *     summary: Update a FAQ
 *     tags: [CMS]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id: { type: string }
 *               question: { type: string }
 *               answer: { type: string }
 *     responses:
 *       '200':
 *         description: FAQ updated
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/cms/addfaq:
 *   post:
 *     summary: Add a FAQ
 *     tags: [CMS]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question, answer]
 *             properties:
 *               question: { type: string }
 *               answer: { type: string }
 *     responses:
 *       '200':
 *         description: FAQ created
 *       '422':
 *         description: Validation error / invalid token
 */

/**
 * @swagger
 * /v1/cms/deletefaq/{id}:
 *   delete:
 *     summary: Delete a FAQ
 *     tags: [CMS]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '209':
 *         description: FAQ deleted
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/cms/cmsdetail:
 *   get:
 *     summary: Get CMS content by slug
 *     tags: [CMS]
 *     parameters:
 *       - in: query
 *         name: data
 *         schema: { type: string }
 *         description: CMS slug
 *     responses:
 *       '200':
 *         description: CMS content fetched
 */

/**
 * @swagger
 * /v1/cms/editcms:
 *   post:
 *     summary: Update CMS content
 *     tags: [CMS]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               id: { type: string }
 *               key: { type: string }
 *               heading: { type: string }
 *               description: { type: string }
 *               cmsimage: { type: string, format: binary }
 *     responses:
 *       '200':
 *         description: CMS updated
 */

/**
 * @swagger
 * /v1/cms/roadmapList:
 *   get:
 *     summary: List roadmap items
 *     tags: [CMS]
 *     responses:
 *       '200':
 *         description: Roadmap fetched
 */

/**
 * @swagger
 * /v1/cms/roadmapupdate:
 *   put:
 *     summary: Update a roadmap item
 *     tags: [CMS]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id: { type: string }
 *               question: { type: string }
 *               answer: { type: string }
 *     responses:
 *       '200':
 *         description: Roadmap updated
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/cms/contactuslist:
 *   get:
 *     summary: List newsletter subscribers
 *     tags: [CMS]
 *     responses:
 *       '200':
 *         description: Subscribers fetched
 */

/**
 * @swagger
 * /v1/cms/planetlist:
 *   get:
 *     summary: List CMS planets
 *     tags: [CMS]
 *     responses:
 *       '200':
 *         description: Planets fetched
 */

/**
 * @swagger
 * /v1/cms/planetupdate:
 *   put:
 *     summary: Update a CMS planet
 *     tags: [CMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id: { type: string }
 *               data: { type: object }
 *     responses:
 *       '200':
 *         description: Planet updated
 */

/**
 * @swagger
 * /v1/cms/cmslist:
 *   get:
 *     summary: List all CMS content
 *     tags: [CMS]
 *     responses:
 *       '200':
 *         description: CMS list fetched
 */

/**
 * @swagger
 * /v1/cms/currencylist:
 *   get:
 *     summary: List currencies
 *     tags: [CMS]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *         description: "Set to 'nft' for NFT-platform currencies, otherwise game currencies"
 *     responses:
 *       '200':
 *         description: Currencies fetched
 */

/**
 * @swagger
 * /v1/cms/createcurrency:
 *   post:
 *     summary: Create a currency
 *     tags: [CMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [label, address, decimal, valueofGalfi]
 *             properties:
 *               label: { type: string }
 *               address: { type: string }
 *               decimal: { type: number }
 *               valueofGalfi: { type: number }
 *     responses:
 *       '200':
 *         description: Currency created
 */

/**
 * @swagger
 * /v1/cms/changecurrencystatus:
 *   post:
 *     summary: Change currency status
 *     tags: [CMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [find, update]
 *             properties:
 *               find: { type: object }
 *               update: { type: object }
 *     responses:
 *       '200':
 *         description: Status updated
 *       '400':
 *         description: Missing required fields
 */

/**
 * @swagger
 * /v1/cms/collectiontypelist:
 *   get:
 *     summary: List collection types
 *     tags: [CMS]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *     responses:
 *       '200':
 *         description: Collection types fetched
 */

/**
 * @swagger
 * /v1/cms/createcollectiontype:
 *   post:
 *     summary: Create a collection type
 *     tags: [CMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type]
 *             properties:
 *               type: { type: string }
 *               imageUrl: { type: string }
 *     responses:
 *       '200':
 *         description: Collection type created
 *       '500':
 *         description: Missing fields
 */

/**
 * @swagger
 * /v1/cms/sociallist:
 *   get:
 *     summary: Get social links
 *     tags: [CMS]
 *     responses:
 *       '200':
 *         description: Social links fetched
 */

/**
 * @swagger
 * /v1/cms/updatesocial:
 *   put:
 *     summary: Update social links
 *     tags: [CMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Social links updated
 */

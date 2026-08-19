/**
 * @swagger
 * tags:
 *   - name: Category
 *     description: NFT categories & sub-categories (/v1/category)
 */

/**
 * @swagger
 * /v1/category/classlist:
 *   get:
 *     summary: List categories (classes)
 *     tags: [Category]
 *     responses:
 *       '200':
 *         description: Categories fetched
 */

/**
 * @swagger
 * /v1/category/categorylist:
 *   get:
 *     summary: List categories with their sub-categories
 *     tags: [Category]
 *     responses:
 *       '200':
 *         description: Categories + sub-categories fetched
 */

/**
 * @swagger
 * /v1/category/addclass:
 *   post:
 *     summary: Add a category
 *     tags: [Category]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *     responses:
 *       '200':
 *         description: Category created
 *       '209':
 *         description: Category already exists
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/category/changeclass:
 *   put:
 *     summary: Toggle category status
 *     tags: [Category]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id: { type: string }
 *               status: { type: boolean }
 *     responses:
 *       '200':
 *         description: Status changed
 *       '422':
 *         description: Invalid/missing token
 */

/**
 * @swagger
 * /v1/category/addsubcategory:
 *   post:
 *     summary: Add a sub-category
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [_id, subname]
 *             properties:
 *               _id: { type: string, description: "Parent category id" }
 *               subname: { type: string }
 *     responses:
 *       '200':
 *         description: Sub-category added
 *       '209':
 *         description: Sub-category already exists
 */

/**
 * @swagger
 * /v1/category/categoryupdate:
 *   put:
 *     summary: Update / add sub-category
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id: { type: string }
 *               subname: { type: string }
 *     responses:
 *       '200':
 *         description: Sub-category updated
 */

/**
 * @swagger
 * /v1/category/subcategorylist:
 *   post:
 *     summary: List sub-categories by category id
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id: { type: string, description: "Classid" }
 *     responses:
 *       '200':
 *         description: Sub-categories fetched
 */

/**
 * @swagger
 * /v1/category/subcategoryvaluelist:
 *   post:
 *     summary: Get sub-category values
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id: { type: string, description: "Sub-category id" }
 *     responses:
 *       '200':
 *         description: Values fetched
 */

/**
 * @swagger
 * /v1/category/addsubcategoryvalue:
 *   post:
 *     summary: Add a value to a sub-category
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id: { type: string, description: "Sub-category id" }
 *               value: { type: string }
 *     responses:
 *       '200':
 *         description: Value added
 */

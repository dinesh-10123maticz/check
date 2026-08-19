/**
 * @swagger
 * tags:
 *   - name: Conversion
 *     description: Token amount conversion (/v1/conversion)
 */

/**
 * @swagger
 * /v1/conversion/convert:
 *   post:
 *     summary: Convert an amount between currencies
 *     tags: [Conversion]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, fromCurrency, toCurrency]
 *             properties:
 *               amount: { type: number }
 *               fromCurrency: { type: string }
 *               toCurrency: { type: string }
 *     responses:
 *       '200':
 *         description: Converted amount
 *       '400':
 *         description: Invalid currency / amount
 */

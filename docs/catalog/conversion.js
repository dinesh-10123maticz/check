const { ep, P } = require('./common');

/**
 * ─────────────────────────────────────────────────────────────
 * AMOUNT CONVERSION MODULE  (mounted at /v1/conversion)
 * ─────────────────────────────────────────────────────────────
 */
module.exports = [
  ep('post', '/v1/conversion/convert', {
    tag: 'Conversion',
    summary: 'Convert fiat (USD) amount to game asset price',
    auth: 'none',
    body: {
      required: ['usd', 'assetType'],
      props: {
        usd: P('number', 'USD amount to convert', { ex: 100 }),
        assetType: P('string', 'Asset type for the price source', { ex: 'planet' }),
      },
      example: { usd: 100, assetType: 'planet' },
    },
    success: {
      code: 200,
      message: 'converted',
      example: {
        statusCode: 200,
        status: true,
        message: 'converted',
        data: { usd: 100, assetType: 'planet', galfi: 1250.5, price: 12.5 },
      },
    },
    errors: ['400', '500'],
  }),
];

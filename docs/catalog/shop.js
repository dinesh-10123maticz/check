const { ep, P } = require('./common');

/**
 * ─────────────────────────────────────────────────────────────
 * SHOP MODULE  (mounted at /v1/shop)
 * In-game shop: planets/asteroids, ships, crews, prices.
 * ─────────────────────────────────────────────────────────────
 */
module.exports = [
  ep('post', '/v1/shop/planetastroid', {
    tag: 'Shop',
    summary: 'Planet & asteroid shop',
    auth: 'game-jwt',
    body: {
      required: ['tabName'],
      props: {
        type: P('string', 'planet | astroid', { ex: 'planet' }),
        tabName: P('string', 'Shop tab', { ex: 'All' }),
        rarity: P('string', 'Rarity filter', { ex: 'rare' }),
        page: P('integer', 'Page', { ex: 1 }),
        limit: P('integer', 'Per page', { ex: 12 }),
      },
      example: { type: 'planet', tabName: 'All', page: 1, limit: 12 },
    },
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { items: [], totalCount: 0 } } },
    errors: ['400', '401', '500'],
  }),

  ep('get', '/v1/shop/types', {
    tag: 'Shop',
    summary: 'Get game market collection types',
    desc: 'Marked "ignore" in source — legacy helper.',
    auth: 'game-jwt',
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [] } },
    errors: ['401', '500'],
  }),

  ep('post', '/v1/shop/ship', {
    tag: 'Shop',
    summary: 'Ship marketplace shop',
    auth: 'game-jwt',
    body: {
      required: ['tabName'],
      props: {
        allowMission: P('boolean', 'Only mission-capable ships', { ex: true }),
        tabName: P('string', 'Shop tab', { ex: 'All' }),
        page: P('integer', 'Page', { ex: 1 }),
        limit: P('integer', 'Per page', { ex: 12 }),
      },
      example: { allowMission: true, tabName: 'All', page: 1, limit: 12 },
    },
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { items: [], totalCount: 0 } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/shop/galficrew', {
    tag: 'Shop',
    summary: 'GALFI crew marketplace shop',
    auth: 'game-jwt',
    body: {
      required: ['tabName'],
      props: {
        tabName: P('string', 'Shop tab', { ex: 'All' }),
        page: P('integer', 'Page', { ex: 1 }),
        limit: P('integer', 'Per page', { ex: 12 }),
        CollectionContractAddress: P('array', 'Contract addresses to include', { ex: ['0x...'] }),
        crewTypes: P('array', 'Crew type filters', { ex: ['ogcrew'] }),
      },
      example: { tabName: 'All', page: 1, limit: 12 },
    },
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { items: [], totalCount: 0 } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/shop/crew', {
    tag: 'Shop',
    summary: 'Crew marketplace shop',
    auth: 'game-jwt',
    body: {
      required: ['tabName'],
      props: {
        tabName: P('string', 'Shop tab', { ex: 'All' }),
        page: P('integer', 'Page', { ex: 1 }),
        limit: P('integer', 'Per page', { ex: 12 }),
        CollectionContractAddress: P('array', 'Contract addresses', { ex: ['0x...'] }),
      },
      example: { tabName: 'All', page: 1, limit: 12 },
    },
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { items: [], totalCount: 0 } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/shop/search', {
    tag: 'Shop',
    summary: 'Search the shop',
    desc: 'Routes to crew or planet search depending on `tabName`.',
    auth: 'game-jwt',
    body: {
      required: ['tabName'],
      props: {
        tabName: P('string', 'Search tab (crew / planet)', { ex: 'crew' }),
        searchWord: P('string', 'Search keyword', { ex: 'pilot' }),
        page: P('integer', 'Page', { ex: 1 }),
        limit: P('integer', 'Per page', { ex: 12 }),
        CollectionContractAddress: P('array', 'Contract addresses', { ex: [] }),
      },
      example: { tabName: 'crew', searchWord: 'pilot', page: 1, limit: 12 },
    },
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { items: [], totalCount: 0 } } },
    errors: ['400', '401', '500'],
  }),

  ep('get', '/v1/shop/category', {
    tag: 'Shop',
    summary: 'Get shop categories',
    auth: 'none',
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [{ _id: '66a...', name: 'Planets' }] } },
    errors: ['500'],
  }),

  ep('post', '/v1/shop/galfispecialcrew', {
    tag: 'Shop',
    summary: 'GALFI special crew marketplace',
    auth: 'game-jwt',
    body: {
      required: ['tabName'],
      props: {
        tabName: P('string', 'Shop tab', { ex: 'All' }),
        page: P('integer', 'Page', { ex: 1 }),
        limit: P('integer', 'Per page', { ex: 12 }),
        searchWord: P('string', 'Search keyword'),
        CollectionContractAddress: P('array', 'Contract addresses', { ex: [] }),
      },
      example: { tabName: 'All', page: 1, limit: 12 },
    },
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { items: [], totalCount: 0 } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/shop/galfipriceforship', {
    tag: 'Shop',
    summary: 'Get GALFI price for a ship',
    desc: 'Yup validation: `shipId` is required.',
    auth: 'game-jwt',
    body: {
      required: ['shipId'],
      props: { shipId: P('string', 'Ship _id') },
      example: { shipId: '66c...' },
    },
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { shipId: '66c...', price: [{ label: 'GALFI', amount: 500 }] } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/shop/galfipriceforBuilding', {
    tag: 'Shop',
    summary: 'Get GALFI price for a building level',
    desc: 'Yup validation: `assetId` (required string), `level` (required number).',
    auth: 'game-jwt',
    body: {
      required: ['assetId', 'level'],
      props: {
        assetId: P('string', 'Building asset _id'),
        level: P('integer', 'Building level', { ex: 3 }),
      },
      example: { assetId: '66e...', level: 3 },
    },
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { assetId: '66e...', level: 3, price: [{ label: 'GALFI', amount: 150 }] } } },
    errors: ['400', '401', '500'],
  }),

  ep('get', '/v1/shop/admin/ship', {
    tag: 'Shop',
    summary: 'Ship market admin list',
    auth: 'admin',
    params: [
      { name: 'page', in: 'query', required: false, t: 'integer', ex: 1 },
      { name: 'limit', in: 'query', required: false, t: 'integer', ex: 10 },
    ],
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { items: [], totalCount: 0 } } },
    errors: ['401', '500'],
  }),

  ep('post', '/v1/shop/admin/editshipprice', {
    tag: 'Shop',
    summary: 'Edit ship price (admin)',
    desc: 'Yup validation: `shipId` is required. `price` and `optionalCost` optional.',
    auth: 'admin',
    body: {
      required: ['shipId'],
      props: {
        shipId: P('string', 'Ship _id'),
        price: P('array', 'Price entries', { ex: [{ label: 'GALFI', amount: 600 }] }),
        optionalCost: P('array', 'Optional cost entries', { ex: [] }),
      },
      example: { shipId: '66c...', price: [{ label: 'GALFI', amount: 600 }] },
    },
    success: { code: 200, message: 'updated', example: { statusCode: 200, status: true, message: 'updated', data: { _id: '66c...' } } },
    errors: ['400', '401', '500'],
  }),
];

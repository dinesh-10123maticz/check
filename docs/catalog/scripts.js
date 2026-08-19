const { ep, P } = require('./common');

/**
 * ─────────────────────────────────────────────────────────────
 * SCRIPTS MODULE  (mounted at /v1/script)
 * ⚠️ DEV / ADMIN ONLY — database seeding & migration utilities.
 * Should NOT be exposed in production.
 * ─────────────────────────────────────────────────────────────
 */
module.exports = [
  ep('post', '/v1/script/create_nearby_planet', {
    tag: 'Scripts (dev)',
    summary: '[SCRIPT] Create nearby planets for all hexes',
    desc: 'Iterates all hex IDs (0 → 50,000) and generates exploration planets. Run ONCE per universe. Not for production.',
    auth: 'none',
    body: { required: [], props: {}, example: {} },
    success: { code: 200, message: 'created', example: { statusCode: 200, status: true, message: 'created', data: { created: 50000 } } },
    errors: ['500'],
  }),

  ep('post', '/v1/script/autoinsertplanetorastroid', {
    tag: 'Scripts (dev)',
    summary: '[SCRIPT] Bulk insert planets & asteroids',
    desc: 'Generates full planet/asteroid NFT collections with rarity tiers. Running twice creates duplicates. Not for production.',
    auth: 'none',
    body: { required: [], props: {}, example: {} },
    success: { code: 200, message: 'inserted', example: { statusCode: 200, status: true, message: 'inserted', data: { inserted: 2500 } } },
    errors: ['500'],
  }),

  ep('post', '/v1/script/autoinsertshipasset', {
    tag: 'Scripts (dev)',
    summary: '[SCRIPT] Bulk insert ship assets',
    desc: 'Loads predefined ship metadata and inserts ships in bulk. Not for production.',
    auth: 'none',
    body: { required: [], props: {}, example: {} },
    success: { code: 200, message: 'inserted', example: { statusCode: 200, status: true, message: 'inserted', data: { inserted: 20 } } },
    errors: ['500'],
  }),

  ep('post', '/v1/script/crewInsert', {
    tag: 'Scripts (dev)',
    summary: '[SCRIPT] Generate male crew NFTs',
    desc: 'Creates ~10,000 crew NFTs with cyclic image wrapping. Not for production.',
    auth: 'none',
    body: { required: [], props: {}, example: {} },
    success: { code: 200, message: 'inserted', example: { statusCode: 200, status: true, message: 'inserted', data: { inserted: 10000 } } },
    errors: ['500'],
  }),

  ep('post', '/v1/script/insertProfessions', {
    tag: 'Scripts (dev)',
    summary: '[SCRIPT] Insert / update profession master data',
    desc: 'UPSERT from seed file — safe to run multiple times (idempotent).',
    auth: 'none',
    body: { required: [], props: {}, example: {} },
    success: { code: 200, message: 'upserted', example: { statusCode: 200, status: true, message: 'upserted', data: { upserted: 12 } } },
    errors: ['500'],
  }),

  ep('post', '/v1/script/createspecialcrew', {
    tag: 'Scripts (dev)',
    summary: '[SCRIPT] Create special crew NFT collections',
    desc: 'Generates premium crew NFTs with rarity distribution and trait metadata. Not for production.',
    auth: 'none',
    body: { required: [], props: {}, example: {} },
    success: { code: 200, message: 'created', example: { statusCode: 200, status: true, message: 'created', data: { inserted: 500 } } },
    errors: ['500'],
  }),

  ep('post', '/v1/script/mission_reward_db_entry', {
    tag: 'Scripts (dev)',
    summary: '[SCRIPT] Seed mission rewards into DB',
    desc: 'Restricted: returns 403 in production.',
    auth: 'none',
    body: { required: [], props: {}, example: {} },
    success: { code: 200, message: 'inserted', example: { statusCode: 200, status: true, message: 'inserted' } },
    errors: ['403', '500'],
  }),

  ep('put', '/v1/script/currencycontractchange', {
    tag: 'Scripts (dev)',
    summary: '[SCRIPT] Change currency contract address',
    auth: 'none',
    body: {
      required: [],
      props: {
        label: P('string', 'Currency symbol', { ex: 'GALFI' }),
        contractAddress: P('string', 'New contract address'),
        network: P('string', 'Network'),
      },
      example: { label: 'GALFI', contractAddress: '0x...', network: 'polygon' },
    },
    success: { code: 200, message: 'updated', example: { statusCode: 200, status: true, message: 'updated' } },
    errors: ['400', '500'],
  }),

  ep('post', '/v1/script/assignCrewToPlanets', {
    tag: 'Scripts (dev)',
    summary: '[SCRIPT] Assign a free crew to each planet/asteroid',
    desc: 'Assigns crews in order — used to give one free crew per purchased planet. Not for production.',
    auth: 'none',
    body: { required: [], props: {}, example: {} },
    success: { code: 200, message: 'assigned', example: { statusCode: 200, status: true, message: 'assigned', data: { assigned: 2500 } } },
    errors: ['500'],
  }),
];

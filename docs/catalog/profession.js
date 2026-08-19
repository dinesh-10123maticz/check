const { ep, P } = require('./common');

/**
 * ─────────────────────────────────────────────────────────────
 * PROFESSION MODULE  (mounted at /v1/profession)
 * Profession master data used by the game engine (crew bonuses).
 * ─────────────────────────────────────────────────────────────
 */
const professionProps = {
  symbol: P('string', 'Unique uppercase symbol (e.g. PILOT)', { ex: 'PILOT' }),
  profession: P('string', 'Profession name', { ex: 'Pilot' }),
  baseContribution: P('object', 'Base contribution stats', { ex: { exploration: 10, science: 5, social: 0, combat: 20 } }),
  baseCost: P('number', 'Base cost', { ex: 100 }),
  rewardModifiers: P('array', 'Reward modifier rules', {
    ex: [{ appliesTo: 'combat', target: 'all', condition: 'level>5', valueType: 'PERCENT', value: 10 }],
  }),
  notes: P('string', 'Free text notes'),
  isActive: P('boolean', 'Active flag', { ex: true }),
};

module.exports = [
  ep('post', '/v1/profession/', {
    tag: 'Profession',
    summary: 'Create a profession',
    desc: 'Validated with `createProfessionSchema` (yup). `appliesTo` ∈ mission|combat|building|resource|ship|global; `valueType` ∈ PERCENT|FLAT.',
    auth: 'none',
    body: {
      required: ['symbol', 'profession', 'baseCost'],
      props: professionProps,
      example: {
        symbol: 'PILOT',
        profession: 'Pilot',
        baseContribution: { exploration: 10, science: 5, social: 0, combat: 20 },
        baseCost: 100,
        rewardModifiers: [{ appliesTo: 'combat', target: 'all', condition: 'level>5', valueType: 'PERCENT', value: 10 }],
      },
    },
    success: { code: 200, message: 'created', example: { statusCode: 200, status: true, message: 'created', data: { _id: '66a...', symbol: 'PILOT' } } },
    errors: ['400', '500'],
  }),

  ep('get', '/v1/profession/', {
    tag: 'Profession',
    summary: 'Get all professions',
    auth: 'none',
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [{ _id: '66a...', symbol: 'PILOT', profession: 'Pilot' }] } },
    errors: ['500'],
  }),

  ep('get', '/v1/profession/id/:id', {
    tag: 'Profession',
    summary: 'Get a profession by _id',
    auth: 'none',
    params: [
      { name: 'id', in: 'path', required: true, t: 'string', d: 'Profession _id', ex: '66a...' },
    ],
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { _id: '66a...', symbol: 'PILOT' } } },
    errors: ['404', '500'],
  }),

  ep('get', '/v1/profession/key/:key', {
    tag: 'Profession',
    summary: 'Get a profession by key (game engine)',
    auth: 'none',
    params: [
      { name: 'key', in: 'path', required: true, t: 'string', d: 'Profession key (symbol)', ex: 'PILOT' },
    ],
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { _id: '66a...', symbol: 'PILOT' } } },
    errors: ['404', '500'],
  }),

  ep('put', '/v1/profession/:id', {
    tag: 'Profession',
    summary: 'Update a profession (partial)',
    auth: 'none',
    params: [
      { name: 'id', in: 'path', required: true, t: 'string', d: 'Profession _id', ex: '66a...' },
    ],
    body: {
      required: [],
      props: professionProps,
      example: { baseCost: 150, isActive: false },
    },
    success: { code: 200, message: 'updated', example: { statusCode: 200, status: true, message: 'updated', data: { _id: '66a...' } } },
    errors: ['400', '404', '500'],
  }),

  ep('delete', '/v1/profession/:key', {
    tag: 'Profession',
    summary: 'Soft-delete a profession by key',
    auth: 'none',
    params: [
      { name: 'key', in: 'path', required: true, t: 'string', d: 'Profession key (symbol)', ex: 'PILOT' },
    ],
    success: { code: 200, message: 'deleted', example: { statusCode: 200, status: true, message: 'deleted' } },
    errors: ['404', '500'],
  }),
];

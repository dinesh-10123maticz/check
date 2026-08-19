const { ep, P } = require('./common');

/**
 * ─────────────────────────────────────────────────────────────
 * MISSION MODULE  (mounted at /v1/mission)
 * Missions: explore / mining / combat / social, ship jumps,
 * mission status & history, admin reward management.
 * ─────────────────────────────────────────────────────────────
 */
const missionBody = {
  nearByPlanetId: P('string', 'Nearby planet _id (required)'),
  userShipId: P('string', 'User ship _id (required)'),
  crew: P('array', 'Crew member ids (at least one required)', { ex: ['66a...'] }),
  scope: P('number', 'Mission scope (required)', { ex: 1 }),
  missiontype: P('string', 'combat | explore | mining | social (required)', { e: ['combat', 'explore', 'mining', 'social'], ex: 'explore' }),
};

module.exports = [
  // ── Admin reward management ───────────────────────────────
  ep('post', '/v1/mission/admin/creatmissionreward', {
    tag: 'Mission',
    summary: 'Create a mission reward (admin)',
    auth: 'admin',
    body: {
      required: ['name'],
      props: {
        name: P('string', 'Reward name'),
        amount: P('number', 'Reward amount'),
        currency: P('string', 'Currency symbol', { ex: 'GALFI' }),
        rarity: P('string', 'Rarity filter', { ex: 'rare' }),
      },
      example: { name: 'Rare planet reward', amount: 500, currency: 'GALFI' },
    },
    success: { code: 200, message: 'created', example: { statusCode: 200, status: true, message: 'created', data: { _id: '66a...' } } },
    errors: ['400', '401', '500'],
  }),

  ep('put', '/v1/mission/admin/missionreward', {
    tag: 'Mission',
    summary: 'Update a mission reward (admin)',
    auth: 'admin',
    body: {
      required: ['id'],
      props: {
        id: P('string', 'Mission reward _id'),
        payload: P('object', 'Fields to update', { ex: { amount: 600 } }),
      },
      example: { id: '66a...', payload: { amount: 600 } },
    },
    success: { code: 200, message: 'updated', example: { statusCode: 200, status: true, message: 'updated' } },
    errors: ['400', '401', '404', '500'],
  }),

  ep('delete', '/v1/mission/admin/missionreward/:id', {
    tag: 'Mission',
    summary: 'Delete a mission reward (admin)',
    auth: 'admin',
    params: [
      { name: 'id', in: 'path', required: true, t: 'string', d: 'Mission reward _id' },
    ],
    success: { code: 200, message: 'deleted', example: { statusCode: 200, status: true, message: 'deleted' } },
    errors: ['401', '404', '500'],
  }),

  ep('get', '/v1/mission/admin/missionrewardlist', {
    tag: 'Mission',
    summary: 'List mission rewards (admin)',
    auth: 'none',
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [{ _id: '66a...', name: 'Rare planet reward', amount: 500 }] } },
    errors: ['500'],
  }),

  ep('get', '/v1/mission/admin/missionbonusreward', {
    tag: 'Mission',
    summary: 'Get mission bonus rewards (admin)',
    auth: 'admin',
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { miningBonusReward: 10, exploreBonusReward: 10, socialBonusReward: 5, combatBonusReward: 20 } } },
    errors: ['401', '500'],
  }),

  ep('put', '/v1/mission/admin/missionbonusreward', {
    tag: 'Mission',
    summary: 'Update mission bonus rewards (admin)',
    desc: 'All four fields are required numbers; empty strings are rejected with a validation error.',
    auth: 'admin',
    body: {
      required: ['miningBonusReward', 'exploreBonusReward', 'socialBonusReward', 'combatBonusReward'],
      props: {
        miningBonusReward: P('number', 'Mining bonus reward', { ex: 10 }),
        exploreBonusReward: P('number', 'Explore bonus reward', { ex: 10 }),
        socialBonusReward: P('number', 'Social bonus reward', { ex: 5 }),
        combatBonusReward: P('number', 'Combat bonus reward', { ex: 20 }),
      },
      example: { miningBonusReward: 10, exploreBonusReward: 10, socialBonusReward: 5, combatBonusReward: 20 },
    },
    success: { code: 200, message: 'updated', example: { statusCode: 200, status: true, message: 'updated' } },
    errors: ['400', '401', '500'],
  }),

  // ── Missions (game engine) ────────────────────────────────
  ep('post', '/v1/mission/missioncrew', {
    tag: 'Mission',
    summary: 'Get crew available for missions',
    auth: 'game',
    body: {
      required: [],
      props: {
        page: P('integer', 'Page', { ex: 1 }),
        limit: P('integer', 'Per page', { ex: 10 }),
      },
      example: { page: 1, limit: 10 },
    },
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { crew: [{ _id: '66a...', name: 'Pilot' }], totalCount: 42 } } },
    errors: ['400', '401', '500'],
  }),

  ep('get', '/v1/mission/missionstatus', {
    tag: 'Mission',
    summary: 'Get mission statuses (pending / claimed / not claimed)',
    auth: 'game',
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { pending: [], claimed: [], notClaimed: [] } } },
    errors: ['401', '500'],
  }),

  ep('post', '/v1/mission/v2/claim/reward', {
    tag: 'Mission',
    summary: 'Claim mission reward (v2)',
    auth: 'game',
    body: {
      required: ['missionStatsId'],
      props: {
        missionStatsId: P('string', 'Mission stats _id'),
        fromNftId: P('string', 'Source NFT id'),
      },
      example: { missionStatsId: '66b...' },
    },
    success: { code: 200, message: 'claimed', example: { statusCode: 200, status: true, message: 'claimed', data: { reward: 500 } } },
    errors: ['400', '401', '404', '500'],
  }),

  ep('get', '/v1/mission/v3/missionstatus', {
    tag: 'Mission',
    summary: 'Get mission status (v3, by type)',
    auth: 'game',
    params: [
      { name: 'type', in: 'query', required: false, t: 'string', d: 'explore | mining | combat | social', ex: 'explore' },
    ],
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { ongoing: [], completed: [] } } },
    errors: ['401', '500'],
  }),

  ep('get', '/v1/mission/v3/missionhistory', {
    tag: 'Mission',
    summary: 'Get mission history (v3)',
    auth: 'game',
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [{ _id: '66b...', missiontype: 'explore', status: 'completed' }] } },
    errors: ['401', '500'],
  }),

  ep('get', '/v1/mission/v3/missionstatus/details/:missionStatsId', {
    tag: 'Mission',
    summary: 'Get mission status details by id',
    desc: 'Returns 422 if `missionStatsId` is missing or invalid.',
    auth: 'none',
    params: [
      { name: 'missionStatsId', in: 'path', required: true, t: 'string', d: 'Mission stats _id' },
    ],
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { _id: '66b...', missiontype: 'explore', rewardClaimed: false } } },
    errors: ['422', '500'],
  }),

  ep('post', '/v1/mission/ship/jump', {
    tag: 'Mission',
    summary: 'Jump a ship from one hex to another (takes time)',
    auth: 'game',
    encrypt: 'game-encrypt',
    body: {
      required: ['userShipId', 'toHexId'],
      props: {
        userShipId: P('string', 'User ship _id'),
        toHexId: P('string', 'Destination hex id'),
      },
      example: { userShipId: '66c...', toHexId: '42' },
    },
    success: { code: 200, message: 'jumping', example: { statusCode: 200, status: true, message: 'jumping', data: { arrivalTime: 1724100000000 } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/mission/v3/explore/start', {
    tag: 'Mission',
    summary: 'Start an exploration mission',
    desc: 'Yup validation: `nearByPlanetId`, `userShipId`, `crew` (non-empty array), `scope`, `missiontype` (combat|explore|mining|social) are required.',
    auth: 'game',
    encrypt: 'game-encrypt',
    body: { required: ['nearByPlanetId', 'userShipId', 'crew', 'scope', 'missiontype'], props: missionBody, example: { nearByPlanetId: '66d...', userShipId: '66c...', crew: ['66a...'], scope: 1, missiontype: 'explore' } },
    success: { code: 200, message: 'mission started', example: { statusCode: 200, status: true, message: 'mission started', data: { missionStatsId: '66b...', endTime: 1724100000000 } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/mission/v3/mining/start', {
    tag: 'Mission',
    summary: 'Start a mining mission',
    desc: 'Same validation as explore start.',
    auth: 'game',
    encrypt: 'game-encrypt',
    body: { required: ['nearByPlanetId', 'userShipId', 'crew', 'scope', 'missiontype'], props: missionBody, example: { nearByPlanetId: '66d...', userShipId: '66c...', crew: ['66a...'], scope: 1, missiontype: 'mining' } },
    success: { code: 200, message: 'mission started', example: { statusCode: 200, status: true, message: 'mission started', data: { missionStatsId: '66b...', endTime: 1724100000000 } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/mission/v3/combat/start', {
    tag: 'Mission',
    summary: 'Start a combat mission',
    desc: 'Same validation as explore start.',
    auth: 'game',
    encrypt: 'game-encrypt',
    body: { required: ['nearByPlanetId', 'userShipId', 'crew', 'scope', 'missiontype'], props: missionBody, example: { nearByPlanetId: '66d...', userShipId: '66c...', crew: ['66a...'], scope: 1, missiontype: 'combat' } },
    success: { code: 200, message: 'mission started', example: { statusCode: 200, status: true, message: 'mission started', data: { missionStatsId: '66b...', endTime: 1724100000000 } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/mission/v3/social/start', {
    tag: 'Mission',
    summary: 'Start a social mission',
    desc: 'Same validation as explore start.',
    auth: 'game',
    encrypt: 'game-encrypt',
    body: { required: ['nearByPlanetId', 'userShipId', 'crew', 'scope', 'missiontype'], props: missionBody, example: { nearByPlanetId: '66d...', userShipId: '66c...', crew: ['66a...'], scope: 1, missiontype: 'social' } },
    success: { code: 200, message: 'mission started', example: { statusCode: 200, status: true, message: 'mission started', data: { missionStatsId: '66b...', endTime: 1724100000000 } } },
    errors: ['400', '401', '500'],
  }),

  ep('get', '/v1/mission/nearbyPlanets/:userplanetId', {
    tag: 'Mission',
    summary: 'Get nearby dummy planets for a user planet',
    auth: 'game',
    params: [
      { name: 'userplanetId', in: 'path', required: true, t: 'string', d: 'User planet _id' },
    ],
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [{ _id: '66d...', hexId: '7', rarity: 'rare' }] } },
    errors: ['401', '404', '500'],
  }),

  ep('get', '/v1/mission/hex', {
    tag: 'Mission',
    summary: 'Get nearby planets for a hex id',
    auth: 'game',
    params: [
      { name: 'hexId', in: 'query', required: true, t: 'string', d: 'Hex id', ex: '7' },
      { name: 'page', in: 'query', required: false, t: 'integer', ex: 1 },
      { name: 'limit', in: 'query', required: false, t: 'integer', ex: 10 },
    ],
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [{ _id: '66d...', hexId: '7' }] } },
    errors: ['400', '401', '500'],
  }),

  ep('get', '/v1/mission/getMissionStats', {
    tag: 'Mission',
    summary: 'Get mission stats (public helper)',
    auth: 'none',
    params: [
      { name: 'userId', in: 'query', required: false, t: 'string', d: 'Filter by user' },
    ],
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [] } },
    errors: ['500'],
  }),

  ep('get', '/v1/mission/missionscope', {
    tag: 'Mission',
    summary: 'Get mission scope / game values',
    auth: 'game',
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { missionPlanetsLimit: [{ rarity: 'rare', limit: 10 }] } } },
    errors: ['401', '500'],
  }),

  ep('get', '/v1/mission/nearbyplanetstatus', {
    tag: 'Mission',
    summary: 'Get nearby planet status for the user',
    auth: 'game',
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [] } },
    errors: ['401', '500'],
  }),
];

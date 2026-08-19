const { ep, P } = require('./common');

/**
 * ─────────────────────────────────────────────────────────────
 * ADMIN MODULE  (mounted at /v1/admin)
 * ─────────────────────────────────────────────────────────────
 */
module.exports = [
  ep('post', '/v1/admin/adminlogin', {
    tag: 'Admin',
    summary: 'Admin login',
    desc: 'Returns a JWT used as `Authorization: Bearer <token>` for all other admin endpoints. Body is AES-encrypted (`data`).',
    auth: 'none',
    encrypt: 'decrypt',
    body: {
      required: ['email', 'password'],
      props: {
        email: P('string', 'Admin email', { ex: 'admin@galfi.com' }),
        password: P('string', 'Admin password', { ex: '••••••••' }),
      },
      example: { email: 'admin@galfi.com', password: 'secret123' },
    },
    success: {
      code: 200,
      message: 'successfully logged in',
      example: { status: true, message: 'successfully logged in', data: true, token: '<JWT>' },
    },
    errors: ['400', '500'],
  }),

  ep('post', '/v1/admin/getForgotPasswordOTP', {
    tag: 'Admin',
    summary: 'Request a forgot-password OTP',
    auth: 'none',
    encrypt: 'decrypt',
    body: {
      required: ['email'],
      props: { email: P('string', 'Admin email', { ex: 'admin@galfi.com' }) },
      example: { email: 'admin@galfi.com' },
    },
    success: { code: 200, message: 'OTP sent', example: { status: true, message: 'OTP sent to your email' } },
    errors: ['400', '500'],
  }),

  ep('put', '/v1/admin/getForgotPasswordOTP', {
    tag: 'Admin',
    summary: 'Reset admin password with OTP',
    auth: 'none',
    encrypt: 'decrypt',
    body: {
      required: ['email', 'otp', 'newPassword', 'confirmNewPassword'],
      props: {
        email: P('string', 'Admin email'),
        otp: P('string', 'OTP received by email'),
        newPassword: P('string', 'New password'),
        confirmNewPassword: P('string', 'Must match newPassword'),
      },
      example: { email: 'admin@galfi.com', otp: '123456', newPassword: 'newsecret', confirmNewPassword: 'newsecret' },
    },
    success: { code: 200, message: 'password updated', example: { status: true, message: 'password updated' } },
    errors: ['400', '500'],
  }),

  ep('get', '/v1/admin/userlist', {
    tag: 'Admin',
    summary: 'List all users (paginated)',
    auth: 'admin',
    params: [
      { name: 'page', in: 'query', required: false, t: 'integer', ex: 1 },
      { name: 'limit', in: 'query', required: false, t: 'integer', ex: 10 },
    ],
    success: { code: 200, message: 'fetched', example: { status: true, message: 'fetched', data: [{ _id: '665f1a...', DisplayName: 'Player1', WalletAddress: '0x1a...' }] } },
    errors: ['401', '500'],
  }),

  ep('post', '/v1/admin/updateuserstatus', {
    tag: 'Admin',
    summary: 'Update user status (active / blocked)',
    desc: '`blockedStatus` must be one of: active, blocked.',
    auth: 'admin',
    encrypt: 'decrypt',
    body: {
      required: ['userId', 'blockedStatus'],
      props: {
        userId: P('string', 'User _id'),
        blockedStatus: P('string', 'active | blocked', { e: ['active', 'blocked'], ex: 'blocked' }),
      },
      example: { userId: '665f1a...', blockedStatus: 'blocked' },
    },
    success: { code: 200, message: 'updated', encrypted: true, example: { status: true, message: 'user status updated' } },
    errors: ['400', '401', '404', '500'],
  }),

  ep('post', '/v1/admin/userdetail', {
    tag: 'Admin',
    summary: 'Get detailed user info',
    auth: 'admin',
    body: {
      required: ['_id'],
      props: { _id: P('string', 'User _id') },
      example: { _id: '665f1a...' },
    },
    success: { code: 200, message: 'fetched', example: { status: true, message: 'fetched', data: { _id: '665f1a...', DisplayName: 'Player1', EmailId: 'p@x.com' } } },
    errors: ['401', '404', '500'],
  }),

  ep('put', '/v1/admin/banuser', {
    tag: 'Admin',
    summary: 'Ban / unban a user',
    auth: 'admin',
    body: {
      required: ['_id', 'status'],
      props: {
        _id: P('string', 'User _id'),
        status: P('boolean', 'true = banned', { ex: true }),
      },
      example: { _id: '665f1a...', status: true },
    },
    success: { code: 200, message: 'user banned', encrypted: true, example: { status: true, message: 'user banned', data: { _id: '665f1a...' } } },
    errors: ['400', '401', '500'],
  }),

  ep('put', '/v1/admin/gamevalue', {
    tag: 'Admin',
    summary: 'Update game values (economy tuning)',
    auth: 'admin',
    body: {
      required: ['rewardTimes'],
      props: {
        rewardTimes: P('number', 'Reward time multiplier', { ex: 2 }),
        costTimes: P('number', 'Cost multiplier', { ex: 1 }),
        consumabelTimes: P('number', 'Consumable multiplier', { ex: 1 }),
      },
      example: { rewardTimes: 2, costTimes: 1 },
    },
    success: { code: 200, message: 'updated', example: { statusCode: 200, status: true, message: 'updated' } },
    errors: ['401', '500'],
  }),

  ep('get', '/v1/admin/gamevalue', {
    tag: 'Admin',
    summary: 'Get current game values',
    auth: 'admin',
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { rewardTimes: 2, costTimes: 1 } } },
    errors: ['401', '500'],
  }),

  ep('get', '/v1/admin/buildings', {
    tag: 'Admin',
    summary: 'Get all building assets',
    auth: 'none',
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [{ _id: '66e...', asset_Name: 'House', levelLimit: 5 }] } },
    errors: ['500'],
  }),

  ep('put', '/v1/admin/build_time', {
    tag: 'Admin',
    summary: 'Edit building build time / level limit / slot',
    auth: 'none',
    body: {
      required: ['id'],
      props: {
        id: P('string', 'Building asset _id'),
        build_Time_in_min: P('number', 'New build time in minutes'),
        levelLimit: P('integer', 'New max level'),
        buildLocationType: P('string', 'Building slot type'),
      },
      example: { id: '66e...', build_Time_in_min: 120, levelLimit: 6 },
    },
    success: { code: 200, message: 'updated', example: { statusCode: 200, status: true, message: 'updated' } },
    errors: ['400', '500'],
  }),

  ep('post', '/v1/admin/creategamevalue', {
    tag: 'Admin',
    summary: 'Create game values document',
    auth: 'none',
    body: {
      required: ['rewardTimes'],
      props: {
        rewardTimes: P('number', 'Reward multiplier'),
        costTimes: P('number', 'Cost multiplier'),
        consumabelTimes: P('number', 'Consumable multiplier'),
        missionPlanetsLimit: P('array', 'Per-rarity planet limits'),
        missionReward: P('array', 'Mission reward definitions'),
      },
      example: { rewardTimes: 1, costTimes: 1, consumabelTimes: 1 },
    },
    success: { code: 200, message: 'created', example: { statusCode: 200, status: true, message: 'created', data: { _id: '66f...' } } },
    errors: ['500'],
  }),

  ep('put', '/v1/admin/missionplanet-limit', {
    tag: 'Admin',
    summary: 'Update mission planet limit by rarity',
    auth: 'admin',
    body: {
      required: ['rarity', 'limit'],
      props: {
        rarity: P('string', 'Rarity: common | uncommon | rare', { ex: 'rare' }),
        limit: P('integer', 'Max planets', { ex: 10 }),
      },
      example: { rarity: 'rare', limit: 10 },
    },
    success: { code: 200, message: 'updated', example: { statusCode: 200, status: true, message: 'updated' } },
    errors: ['400', '401', '500'],
  }),

  ep('put', '/v1/admin/gamesetting-mission-time', {
    tag: 'Admin',
    summary: 'Update mission time settings (reward entry)',
    auth: 'admin',
    body: {
      required: ['_id'],
      props: {
        _id: P('string', 'missionReward entry _id'),
        mission_min: P('number', 'Mission duration in minutes'),
        rewardTimes: P('number', 'Reward multiplier'),
        xpmin: P('number', 'Min XP'),
        xpmax: P('number', 'Max XP'),
      },
      example: { _id: '66f...', mission_min: 30, rewardTimes: 2, xpmin: 10, xpmax: 50 },
    },
    success: { code: 200, message: 'updated', example: { statusCode: 200, status: true, message: 'updated' } },
    errors: ['401', '500'],
  }),

  ep('put', '/v1/admin/gamesetting', {
    tag: 'Admin',
    summary: 'Update game settings',
    auth: 'admin',
    body: {
      required: [],
      props: {
        rewardTimes: P('number', 'Reward multiplier'),
        costTimes: P('number', 'Cost multiplier'),
        consumabelTimes: P('number', 'Consumable multiplier'),
      },
      example: { rewardTimes: 3 },
    },
    success: { code: 200, message: 'updated', example: { statusCode: 200, status: true, message: 'updated' } },
    errors: ['401', '500'],
  }),

  ep('put', '/v1/admin/updategamesetting', {
    tag: 'Admin',
    summary: 'Update game settings (partial)',
    auth: 'admin',
    body: {
      required: [],
      props: {
        rewardTimes: P('number', 'Reward multiplier'),
        costTimes: P('number', 'Cost multiplier'),
        consumabelTimes: P('number', 'Consumable multiplier'),
      },
      example: { costTimes: 1.5 },
    },
    success: { code: 200, message: 'updated', example: { statusCode: 200, status: true, message: 'updated' } },
    errors: ['401', '500'],
  }),

  ep('put', '/v1/admin/addMissionRewards', {
    tag: 'Admin',
    summary: 'Add mission reward on game settings',
    auth: 'admin',
    body: {
      required: ['missionReward'],
      props: {
        missionReward: P('array', 'Mission reward entries', { ex: [{ mission_min: 30, rewardTimes: 2, xpmin: 10, xpmax: 50 }] }),
      },
      example: { missionReward: [{ mission_min: 30, rewardTimes: 2, xpmin: 10, xpmax: 50 }] },
    },
    success: { code: 200, message: 'added', example: { statusCode: 200, status: true, message: 'added' } },
    errors: ['400', '401', '500'],
  }),

  ep('delete', '/v1/admin/deleteMissionRewards', {
    tag: 'Admin',
    summary: 'Delete a mission reward from game settings',
    auth: 'admin',
    body: {
      required: ['missionRewardId'],
      props: { missionRewardId: P('string', 'missionReward entry _id') },
      example: { missionRewardId: '66f...' },
    },
    success: { code: 200, message: 'deleted', example: { statusCode: 200, status: true, message: 'deleted' } },
    errors: ['400', '401', '500'],
  }),

  ep('get', '/v1/admin/getMissionRewards', {
    tag: 'Admin',
    summary: 'Get mission rewards from game settings',
    auth: 'admin',
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { missionReward: [{ _id: '66f...', mission_min: 30 }] } } },
    errors: ['401', '500'],
  }),

  ep('put', '/v1/admin/changeairdropnft', {
    tag: 'Admin',
    summary: '[REMOVED] Change airdrop NFT',
    desc: 'This endpoint is removed. Always returns HTTP 410 Gone.',
    auth: 'none',
    success: { code: 410, message: 'no more', example: { status: true, message: 'no more' } },
    errors: [],
  }),

  ep('get', '/v1/admin/getairdropnft', {
    tag: 'Admin',
    summary: '[REMOVED] Get airdrop NFT',
    desc: 'This endpoint is removed (no handler).',
    auth: 'none',
    success: { code: 410, message: 'no more', example: {} },
    errors: [],
  }),

  ep('put', '/v1/admin/updateCrewCost', {
    tag: 'Admin',
    summary: 'Update crew NFT cost',
    auth: 'admin',
    body: {
      required: ['nftCost'],
      props: { nftCost: P('number', 'New crew NFT cost', { ex: 250 }) },
      example: { nftCost: 250 },
    },
    success: { code: 200, message: 'updated', example: { statusCode: 200, status: true, message: 'updated' } },
    errors: ['400', '401', '500'],
  }),

  ep('get', '/v1/admin/getDashboardData', {
    tag: 'Admin',
    summary: 'Admin dashboard statistics',
    auth: 'admin',
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { totalUsers: 1200, totalNfts: 50000, totalVolume: 250000 } } },
    errors: ['401', '500'],
  }),
];

const { ep, P } = require('./common');

/**
 * ─────────────────────────────────────────────────────────────
 * EXCHANGE MODULE  (mounted at /v1/exchange)
 * Token staking pools, staking, claiming, withdrawal, conversion.
 * ─────────────────────────────────────────────────────────────
 */
module.exports = [
  ep('post', '/v1/exchange/stack', {
    tag: 'Exchange',
    summary: 'Stake tokens into a pool (game engine)',
    auth: 'game',
    body: {
      required: ['poolId', 'amount'],
      props: {
        poolId: P('string', 'Token pool _id'),
        amount: P('number', 'Amount to stake (must be positive)', { ex: 100 }),
      },
      example: { poolId: '66a...', amount: 100 },
    },
    success: { code: 200, message: 'staked', example: { statusCode: 200, status: true, message: 'staked', data: { _id: '66b...', poolId: '66a...', amount: 100 } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/exchange/stacktoken', {
    tag: 'Exchange',
    summary: 'Stake tokens into a pool (validated)',
    desc: 'Yup validation: `poolId` (required string), `amount` (required positive number).',
    auth: 'game',
    body: {
      required: ['poolId', 'amount'],
      props: {
        poolId: P('string', 'Token pool _id'),
        amount: P('number', 'Amount to stake (must be positive)', { ex: 100 }),
      },
      example: { poolId: '66a...', amount: 100 },
    },
    success: { code: 200, message: 'staked', example: { statusCode: 200, status: true, message: 'staked', data: { _id: '66b...', poolId: '66a...', amount: 100, claimed: false } } },
    errors: ['400', '401', '500'],
  }),

  ep('get', '/v1/exchange/tokenpoollist', {
    tag: 'Exchange',
    summary: 'Get active token pools (public)',
    auth: 'none',
    success: {
      code: 200,
      message: 'fetched',
      example: {
        statusCode: 200, status: true, message: 'fetched',
        data: [{ _id: '66a...', name: 'GALFI 30d', lockedPeriod: 30, rewardPercent: 10, isActive: true }],
      },
    },
    errors: ['500'],
  }),

  ep('get', '/v1/exchange/admin/tokenpoollist', {
    tag: 'Exchange',
    summary: 'Get all token pools incl. inactive (admin)',
    auth: 'none',
    success: {
      code: 200,
      message: 'fetched',
      example: {
        statusCode: 200, status: true, message: 'fetched',
        data: [{ _id: '66a...', name: 'GALFI 30d', lockedPeriod: 30, rewardPercent: 10, isActive: false }],
      },
    },
    errors: ['500'],
  }),

  ep('post', '/v1/exchange/admin/tokenpoolstatus', {
    tag: 'Exchange',
    summary: 'Toggle token pool visibility',
    auth: 'admin',
    body: {
      required: ['_id'],
      props: { _id: P('string', 'Token pool _id') },
      example: { _id: '66a...' },
    },
    success: { code: 200, message: 'change to visible/hidden', example: { statusCode: 200, status: true, message: 'change to visible', data: { _id: '66a...', isActive: true } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/exchange/admin/createtokenpool', {
    tag: 'Exchange',
    summary: 'Create a token pool (admin)',
    desc: 'Yup validation: `name`, `lockedPeriod`, `rewardPercent`, `stakeCurrencyId`, `rewardCurrencyId` are required.',
    auth: 'admin',
    body: {
      required: ['name', 'lockedPeriod', 'rewardPercent', 'stakeCurrencyId', 'rewardCurrencyId'],
      props: {
        imageUrl: P('string', 'Pool image URL (optional)'),
        name: P('string', 'Pool name', { ex: 'GALFI 30d' }),
        lockedPeriod: P('integer', 'Lock period in days (positive)', { ex: 30 }),
        rewardPercent: P('number', 'Reward percentage (positive)', { ex: 10 }),
        stakeCurrencyId: P('string', 'Currency _id users stake', { ex: '664a...' }),
        rewardCurrencyId: P('string', 'Currency _id users earn', { ex: '664a...' }),
      },
      example: { name: 'GALFI 30d', lockedPeriod: 30, rewardPercent: 10, stakeCurrencyId: '664a...', rewardCurrencyId: '664a...' },
    },
    success: { code: 201, message: 'created successfully', example: { statusCode: 201, status: true, message: 'created successfully', data: { _id: '66a...', name: 'GALFI 30d' } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/exchange/admin/updatetokenpool', {
    tag: 'Exchange',
    summary: 'Update a token pool (admin)',
    desc: 'Yup validation: `_id` is required. The updatable fields live inside a nested `payload` object.',
    auth: 'admin',
    body: {
      required: ['_id'],
      props: {
        _id: P('string', 'Token pool _id'),
        payload: P('object', 'Fields to update', {
          ex: { imageUrl: '...', name: 'GALFI 60d', rewardPercent: 12, lockedPeriod: 60, stakeCurrencyId: '664a...', rewardCurrencyId: '664a...' },
        }),
      },
      example: { _id: '66a...', payload: { name: 'GALFI 60d', lockedPeriod: 60, rewardPercent: 12 } },
    },
    success: { code: 200, message: 'updated successfully', example: { statusCode: 200, status: true, message: 'updated successfully', data: { _id: '66a...' } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/exchange/claimstackedtoken', {
    tag: 'Exchange',
    summary: 'Claim a staked position',
    auth: 'game',
    body: {
      required: ['tokenStakeId'],
      props: { tokenStakeId: P('string', 'Token stake _id') },
      example: { tokenStakeId: '66b...' },
    },
    success: { code: 200, message: 'claimed', example: { statusCode: 200, status: true, message: 'claimed', data: { _id: '66b...', claimed: true } } },
    errors: ['400', '401', '404', '500'],
  }),

  ep('get', '/v1/exchange/stakedtokendetails', {
    tag: 'Exchange',
    summary: 'Get stacked (staked) token details for the user',
    auth: 'game',
    success: {
      code: 200,
      message: 'fetched stacked details',
      example: {
        statusCode: 200, status: true, message: 'fetched stacked details',
        data: { active: [{ _id: '66b...', amount: 100, claimable: 110 }], claimed: [] },
      },
    },
    errors: ['401', '500'],
  }),

  ep('post', '/v1/exchange/getclaim', {
    tag: 'Exchange',
    summary: 'Get claimable balance from a pool',
    desc: '`accoundAddress` must match the authenticated user wallet, otherwise 422. Payload is AES-encrypted in `token`.',
    auth: 'game',
    encrypt: 'game-encrypt',
    body: {
      required: ['amount', 'tokenAddress', 'accoundAddress', 'contractAddress', 'network'],
      props: {
        amount: P('string', 'Amount'),
        tokenAddress: P('string', 'Token contract address'),
        accoundAddress: P('string', 'Account wallet (must equal JWT user wallet)'),
        contractAddress: P('string', 'Pool/reward contract address'),
        network: P('string', 'Network', { ex: 'polygon' }),
      },
      example: { amount: '100', tokenAddress: '0x...', accoundAddress: '0x1a...', contractAddress: '0x...', network: 'polygon' },
    },
    success: {
      code: 200,
      message: 'fetched',
      example: { statusCode: 200, status: true, message: 'fetched', data: { claimable: '100' } },
    },
    errors: ['400', '401', '422', '500'],
  }),

  ep('post', '/v1/exchange/withdraw', {
    tag: 'Exchange',
    summary: 'Withdraw balance (game engine, encrypted)',
    desc: 'Requires `tokenName`, `amount` and `transactionHash` — otherwise 400 `invalid data`. Response is encrypted.',
    auth: 'game',
    encrypt: 'game-encrypt',
    body: {
      required: ['tokenName', 'amount', 'transactionHash'],
      props: {
        tokenName: P('string', 'Token symbol', { ex: 'GALFI' }),
        amount: P('string', 'Amount to withdraw'),
        transactionHash: P('string', 'Withdrawal transaction hash'),
      },
      example: { tokenName: 'GALFI', amount: '50', transactionHash: '0xabc...' },
    },
    success: {
      code: 200,
      message: 'withdrawn',
      example: { statusCode: 200, status: true, message: 'withdrawn', data: { balance: 1200 } },
    },
    errors: ['400', '401', '500'],
  }),

  ep('get', '/v1/exchange/admin/transcation', {
    tag: 'Exchange',
    summary: 'Get transactions (admin)',
    desc: 'Route currently binds to the withdraw controller; documented here as the transaction listing endpoint.',
    auth: 'none',
    params: [
      { name: 'page', in: 'query', required: false, t: 'integer', ex: 1 },
      { name: 'limit', in: 'query', required: false, t: 'integer', ex: 10 },
    ],
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [{ _id: '66c...', walletAddress: '0x1a...', action: 'deposite', token: 100 }] } },
    errors: ['400', '500'],
  }),

  ep('post', '/v1/exchange/convert/price', {
    tag: 'Exchange',
    summary: 'Convert USD to asset price',
    auth: 'none',
    body: {
      required: ['usd', 'assetType'],
      props: {
        usd: P('number', 'USD amount', { ex: 100 }),
        assetType: P('string', 'Asset type', { ex: 'planet' }),
      },
      example: { usd: 100, assetType: 'planet' },
    },
    success: {
      code: 200,
      message: 'converted',
      example: { statusCode: 200, status: true, message: 'converted', data: { usd: 100, assetType: 'planet', price: 1250.5 } },
    },
    errors: ['400', '500'],
  }),

  ep('post', '/v1/exchange/dev/updatemoney', {
    tag: 'Exchange',
    summary: '[DEV] Update user balance directly',
    desc: 'Development-only endpoint to top-up/alter a user balance.',
    auth: 'none',
    body: {
      required: ['walletAddress'],
      props: {
        walletAddress: P('string', 'Wallet address'),
        balance: P('number', 'New balance'),
        stacked: P('number', 'New stacked balance'),
        label: P('string', 'Currency symbol', { ex: 'GALFI' }),
      },
      example: { walletAddress: '0x1a...', balance: 1000, label: 'GALFI' },
    },
    success: { code: 200, message: 'updated', example: { statusCode: 200, status: true, message: 'updated', data: { balance: 1000 } } },
    errors: ['400', '500'],
  }),
];

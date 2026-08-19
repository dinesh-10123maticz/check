const { ep, P } = require('./common');

/**
 * ─────────────────────────────────────────────────────────────
 * USER MODULE  (mounted at /v1/user)
 * ─────────────────────────────────────────────────────────────
 */
module.exports = [
  // ── Registration & profile ────────────────────────────────
  ep('post', '/v1/user/create', {
    tag: 'User',
    summary: 'Register a new user profile (marketplace)',
    desc: 'Creates a marketplace user profile with social links, display name and custom URL. Body is AES-encrypted (`data`).',
    auth: 'none',
    encrypt: 'decrypt',
    body: {
      required: ['WalletAddress', 'WalletType'],
      props: {
        WalletAddress: P('string', 'Wallet address of the user', { ex: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b' }),
        WalletType: P('string', 'Wallet provider type (e.g. metamask, walletconnect)', { ex: 'metamask' }),
        EmailId: P('string', 'Email address (optional)', { ex: 'user@example.com' }),
        DisplayName: P('string', 'Display name (falls back to WalletAddress if empty)', { ex: 'GalaxyExplorer' }),
        Youtube: P('string', 'YouTube profile URL', { ex: 'https://youtube.com/@user' }),
        Facebook: P('string', 'Facebook profile URL', { ex: 'https://facebook.com/user' }),
        Twitter: P('string', 'Twitter/X profile URL', { ex: 'https://x.com/user' }),
        Instagram: P('string', 'Instagram profile URL', { ex: 'https://instagram.com/user' }),
        Bio: P('string', 'Short biography', { ex: 'NFT collector and gamer' }),
        CustomUrl: P('string', 'Custom profile URL slug (falls back to WalletAddress)', { ex: 'galaxyexplorer' }),
        image_key: P('string', 'S3 key of the profile image (optional)', { ex: 'user/0x.../profile/1712345678901.png' }),
      },
      example: {
        WalletAddress: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
        WalletType: 'metamask',
        DisplayName: 'GalaxyExplorer',
        EmailId: 'user@example.com',
        CustomUrl: 'galaxyexplorer',
        Bio: 'NFT collector and gamer',
      },
    },
    success: {
      code: 201,
      message: 'connected successfully',
      encrypted: true,
      example: {
        status: true,
        message: 'connected successfully',
        data: {
          _id: '665f1a2b3c4d5e6f7a8b9c0d',
          DisplayName: 'GalaxyExplorer',
          CustomUrl: 'galaxyexplorer',
          WalletAddress: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
          profile_url: 'https://cdn.galfi.com/user/0x.../profile/1712345678901.png',
        },
        token: '<JWT>',
        usercuurency: [
          { label: 'GALFI', balance: 0, stacked: 0, walletAddress: '0x1a...' },
        ],
      },
    },
    errors: ['400', '409', '500'],
  }),

  ep('post', '/v1/user/edit', {
    tag: 'User',
    summary: 'Edit the logged-in user profile',
    desc: 'Updates profile fields for the authenticated user. Body is AES-encrypted (`data`).',
    auth: 'user',
    encrypt: 'decrypt',
    body: {
      required: [],
      props: {
        WalletAddress: P('string', 'Wallet address', { ex: '0x1a...' }),
        EmailId: P('string', 'Email address', { ex: 'user@example.com' }),
        DisplayName: P('string', 'New display name', { ex: 'NewName' }),
        Youtube: P('string', 'YouTube URL'),
        Facebook: P('string', 'Facebook URL'),
        Twitter: P('string', 'Twitter URL'),
        Instagram: P('string', 'Instagram URL'),
        Bio: P('string', 'Biography'),
        CustomUrl: P('string', 'Custom URL slug'),
        Profile: P('string', 'Profile image key/URL'),
        Cover: P('string', 'Cover image key/URL'),
      },
      example: { WalletAddress: '0x1a...', DisplayName: 'NewName', Bio: 'Updated bio', CustomUrl: 'newname' },
    },
    success: {
      code: 201,
      message: 'updated successfully',
      example: {
        statusCode: 201,
        status: true,
        data: { _id: '665f1a2b3c4d5e6f7a8b9c0d', DisplayName: 'NewName', CustomUrl: 'newname' },
        token: '<JWT>',
        message: 'updated successfully',
      },
    },
    errors: ['400', '401', '409', '500'],
  }),

  // ── Connect / auth ────────────────────────────────────────
  ep('post', '/v1/user/connect', {
    tag: 'User',
    summary: 'Connect wallet (marketplace)',
    desc: 'Checks if the wallet exists; returns the user + JWT, or creates a placeholder account. Body is AES-encrypted (`data`).',
    auth: 'none',
    encrypt: 'decrypt',
    body: {
      required: ['WalletAddress'],
      props: { WalletAddress: P('string', 'Wallet address', { ex: '0x1a...' }) },
      example: { WalletAddress: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b' },
    },
    success: {
      code: 200,
      message: 'Wallet connected successfully',
      encrypted: true,
      example: {
        status: true,
        data: { _id: '665f1a...', DisplayName: '0x1a...', WalletAddress: '0x1a...' },
        token: '<JWT>',
        message: 'Wallet connected successfully',
      },
    },
    errors: ['400', '500'],
  }),

  ep('post', '/v1/user/gameconnect', {
    tag: 'User',
    summary: 'Connect wallet to the game engine',
    desc: 'Game entry point. `time` must be a millisecond timestamp; session expires after 30 minutes. Returns user, currencies, JWT and hex IDs.',
    auth: 'none',
    encrypt: 'none',
    body: {
      required: ['WalletAddress', 'time'],
      props: {
        WalletAddress: P('string', 'Wallet address', { ex: '0x1a...' }),
        time: P('integer', 'Current timestamp (ms). Rejected if older than 30 minutes', { ex: 1724000000000 }),
      },
      example: { WalletAddress: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b', time: 1724000000000 },
    },
    success: {
      code: 200,
      message: 'Wallet connected successfully',
      example: {
        statusCode: 200,
        status: true,
        message: 'Wallet connected successfully',
        data: {
          user: { _id: '665f1a...', DisplayName: 'Player1', WalletAddress: '0x1a...' },
          usercurrency: [{ label: 'GALFI', balance: 1250, stacked: 100, currencyId: '664a...' }],
          token: '<JWT>',
          hexIds: ['1', '2', '3'],
          shipHexIds: ['4', '5'],
        },
      },
    },
    errors: ['400', '500'],
  }),

  ep('post', '/v1/user/v2/gameconnect', {
    tag: 'User',
    summary: 'Connect wallet to the game engine (encrypted v2)',
    desc: 'Same as `/gameconnect` but the payload is AES-encrypted in `token`.',
    auth: 'none',
    encrypt: 'game-encrypt',
    body: {
      required: ['WalletAddress', 'time'],
      props: {
        WalletAddress: P('string', 'Wallet address'),
        time: P('integer', 'Timestamp (ms); must be within 30 minutes'),
      },
      example: { WalletAddress: '0x1a...', time: 1724000000000 },
    },
    success: {
      code: 200,
      message: 'Wallet connected successfully',
      example: {
        statusCode: 200,
        status: true,
        message: 'Wallet connected successfully',
        data: { user: {}, usercurrency: [], token: '<JWT>', hexIds: [], shipHexIds: [] },
      },
    },
    errors: ['400', '500'],
  }),

  ep('post', '/v1/user/creategameuser', {
    tag: 'User',
    summary: 'Create a game user (register from game)',
    desc: 'Registers a game account. Returns JWT. Also handles referral codes. DisplayName must be longer than 4 characters.',
    auth: 'none',
    encrypt: 'none',
    body: {
      required: ['WalletAddress', 'DisplayName'],
      props: {
        refferalByCode: P('string', 'Referral code of another user (optional)', { ex: 'PLAYGAL1' }),
        Type: P('string', 'Account type', { ex: 'game' }),
        WalletAddress: P('string', 'Wallet address', { ex: '0x1a...' }),
        WalletType: P('string', 'Wallet type', { ex: 'metamask' }),
        EmailId: P('string', 'Email', { ex: 'user@example.com' }),
        DisplayName: P('string', 'Display name (min 5 chars)', { ex: 'PlayerOne' }),
        imageKey: P('string', 'S3 image key'),
        Youtube: P('string', 'YouTube URL'),
        Facebook: P('string', 'Facebook URL'),
        Twitter: P('string', 'Twitter URL'),
        Instagram: P('string', 'Instagram URL'),
        Bio: P('string', 'Bio'),
        CustomUrl: P('string', 'Custom URL'),
      },
      example: { WalletAddress: '0x1a...', DisplayName: 'PlayerOne', refferalByCode: 'PLAYGAL1' },
    },
    success: {
      code: 201,
      message: 'Created successfully',
      example: {
        status: true,
        data: { _id: '665f1a...', DisplayName: 'PlayerOne', refferalCode: 'PLAYGAL1', refferalByCode: 'PLAYGAL1' },
        token: '<JWT>',
        message: 'Created successfully',
      },
    },
    errors: ['400', '409', '500'],
  }),

  ep('post', '/v1/user/editgameuser', {
    tag: 'User',
    summary: 'Edit the game user profile',
    auth: 'game',
    encrypt: 'none',
    body: {
      required: [],
      props: {
        EmailId: P('string', 'Email'),
        DisplayName: P('string', 'Display name'),
        Youtube: P('string', 'YouTube URL'),
        Facebook: P('string', 'Facebook URL'),
        Twitter: P('string', 'Twitter URL'),
        Instagram: P('string', 'Instagram URL'),
        Bio: P('string', 'Bio'),
        imageKey: P('string', 'S3 image key'),
        customUrl: P('string', 'Custom URL'),
      },
      example: { DisplayName: 'PlayerOne', Bio: 'hello galaxy' },
    },
    success: {
      code: 201,
      message: 'updated successfully',
      example: {
        statusCode: 201, status: true,
        data: { _id: '665f1a...', DisplayName: 'PlayerOne' },
        token: '<JWT>',
        message: 'updated successfully',
      },
    },
    errors: ['400', '401', '409', '500'],
  }),

  ep('get', '/v1/user/getprofile/:CustomUrl', {
    tag: 'User',
    summary: 'Get a public user profile by custom URL',
    auth: 'none',
    params: [
      { name: 'CustomUrl', in: 'path', required: true, t: 'string', d: 'Custom URL slug of the profile', ex: 'galaxyexplorer' },
    ],
    success: {
      code: 200,
      message: 'success',
      example: {
        status: true,
        message: 'success',
        data: { _id: '665f1a...', DisplayName: 'GalaxyExplorer', CustomUrl: 'galaxyexplorer', profile_url: 'https://cdn.galfi.com/...', Bio: 'NFT collector' },
      },
    },
    errors: ['400', '404', '500'],
  }),

  // ── Images ────────────────────────────────────────────────
  ep('put', '/v1/user/profileimage', {
    tag: 'User',
    summary: 'Update profile image',
    desc: 'Updates the avatar. Body fields or multipart file upload.',
    auth: 'user',
    encrypt: 'none',
    body: {
      required: ['WalletAddress'],
      props: {
        WalletAddress: P('string', 'Wallet address'),
        Profile: P('string', 'Profile image key/URL'),
        Cover: P('string', 'Cover image key/URL'),
      },
      example: { WalletAddress: '0x1a...', Profile: 'user/0x.../profile/1712345678901.png' },
    },
    success: { code: 201, message: 'Profile Image Updated Successfully', example: { status: true, message: 'Profile Image Updated Successfully', data: { _id: '665f1a...', Profile: 'user/0x.../profile/1712345678901.png' } } },
    errors: ['400', '401', '409', '500'],
  }),

  ep('put', '/v1/user/coverimage', {
    tag: 'User',
    summary: 'Update cover image',
    auth: 'user',
    encrypt: 'none',
    body: {
      required: ['WalletAddress'],
      props: {
        WalletAddress: P('string', 'Wallet address'),
        Profile: P('string', 'Profile image key/URL'),
        Cover: P('string', 'Cover image key/URL'),
      },
      example: { WalletAddress: '0x1a...', Cover: 'user/0x.../cover/1712345678901.png' },
    },
    success: { code: 201, message: 'cover image updated successfully', example: { status: true, message: 'cover image updated successfully', data: { _id: '665f1a...', Cover: 'user/0x.../cover/1712345678901.png' } } },
    errors: ['400', '401', '409', '500'],
  }),

  // ── Balance / currency ────────────────────────────────────
  ep('get', '/v1/user/getbalance', {
    tag: 'User',
    summary: 'Get on-chain + off-chain token balances',
    auth: 'none',
    params: [
      { name: 'walletAddress', in: 'query', required: true, t: 'string', d: 'Wallet address', ex: '0x1a...' },
      { name: 'network', in: 'query', required: false, t: 'string', d: 'Blockchain network (e.g. polygon)', ex: 'polygon' },
    ],
    success: {
      code: 200,
      message: 'fetched',
      example: {
        statusCode: 200, status: true, message: 'fetched',
        data: [
          { label: 'GALFI', balance: 1250.5, stacked: 100, contractAddress: '0x...', network: 'polygon' },
        ],
      },
    },
    errors: ['404', '500'],
  }),

  ep('post', '/v1/user/addbalance', {
    tag: 'User',
    summary: 'Add balance to a user currency (admin/dev helper)',
    auth: 'none',
    encrypt: 'none',
    body: {
      required: ['walletAddress', 'currencyId'],
      props: {
        walletAddress: P('string', 'Wallet address'),
        stacked: P('number', 'Amount to add to stacked balance', { ex: 0 }),
        currencyId: P('string', 'Currency _id', { ex: '664a1b2c...' }),
        balance: P('number', 'Amount to add to balance', { ex: 500 }),
      },
      example: { walletAddress: '0x1a...', currencyId: '664a1b2c...', balance: 500, stacked: 0 },
    },
    success: { code: 200, message: 'Success', example: { statusCode: 200, status: true, message: 'Success', data: { walletAddress: '0x1a...', balance: 500 } } },
    errors: ['404', '500'],
  }),

  ep('post', '/v1/user/depositebalance', {
    tag: 'User',
    summary: 'Deposit on-chain balance after a transaction (game)',
    desc: 'Validates the transaction hash on-chain, credits the user currency balance and records a DEPOSITE transaction. All four fields are required.',
    auth: 'game',
    encrypt: 'none',
    body: {
      required: ['walletAddress', 'tokenName', 'amount', 'transactionHash'],
      props: {
        walletAddress: P('string', 'Wallet address'),
        tokenName: P('string', 'Token symbol (e.g. GALFI)', { ex: 'GALFI' }),
        amount: P('number', 'Amount deposited', { ex: 100 }),
        transactionHash: P('string', 'On-chain transaction hash', { ex: '0xabc123...' }),
      },
      example: { walletAddress: '0x1a...', tokenName: 'GALFI', amount: 100, transactionHash: '0xabc123...' },
    },
    success: {
      code: 200,
      message: 'Success',
      example: { statusCode: 200, status: true, message: 'Success', data: { balance: { balance: 1350 } } },
    },
    errors: ['400', '401', '500'],
  }),

  // ── Social / notifications ────────────────────────────────
  ep('post', '/v1/user/FollowUnFollow', {
    tag: 'User',
    summary: 'Follow / unfollow a user',
    auth: 'user',
    encrypt: 'none',
    body: {
      required: ['MyItemAddr', 'ClickAddr'],
      props: {
        MyItemAddr: P('string', 'The follower (own) wallet address'),
        ClickAddr: P('string', 'The profile being followed'),
        MyItemCustomUrl: P('string', 'Own custom URL'),
        ClickCustomUrl: P('string', 'Target profile custom URL'),
      },
      example: { MyItemAddr: '0x1a...', ClickAddr: '0x2b...', ClickCustomUrl: 'targetuser' },
    },
    success: {
      code: 200,
      message: 'follow | unfollow',
      example: { status: true, message: 'follow', data: { followed: '0x2b...' } },
    },
    errors: ['400', '401', '500'],
  }),

  ep('get', '/v1/user/notification', {
    tag: 'User',
    summary: 'Get notifications for the logged-in user',
    auth: 'user',
    success: {
      code: 200,
      message: 'fetched',
      example: { statusCode: 200, status: true, message: 'fetched', data: [{ _id: '66a1...', type: 'bid', text: 'New bid on your NFT', read: false }] },
    },
    errors: ['401', '500'],
  }),

  ep('post', '/v1/user/newsletter', {
    tag: 'User',
    summary: 'Subscribe to the newsletter',
    auth: 'none',
    encrypt: 'decrypt',
    body: {
      required: ['email'],
      props: { email: P('string', 'Email address', { ex: 'user@example.com' }) },
      example: { email: 'user@example.com' },
    },
    success: { code: 201, message: 'subscribed', example: { status: true, message: 'subscribed' } },
    errors: ['400', '409', '500'],
  }),

  // ── Game profile helpers ──────────────────────────────────
  ep('get', '/v1/user/gameuserprofile', {
    tag: 'User',
    summary: 'Get game user profile (game engine)',
    auth: 'game',
    success: {
      code: 200,
      message: 'fetched',
      example: { statusCode: 200, status: true, message: 'fetched', data: { _id: '665f1a...', DisplayName: 'PlayerOne', WalletAddress: '0x1a...', isTutorialPlayed: false } },
    },
    errors: ['401', '500'],
  }),

  ep('put', '/v1/user/isTutorialPlayed', {
    tag: 'User',
    summary: 'Mark tutorial as played',
    auth: 'game',
    success: { code: 200, message: 'updated', example: { statusCode: 200, status: true, message: 'updated' } },
    errors: ['401', '500'],
  }),

  ep('post', '/v1/user/claimfreereward', {
    tag: 'User',
    summary: 'Claim the free reward (game)',
    auth: 'game',
    success: { code: 200, message: 'claimed', example: { statusCode: 200, status: true, message: 'claimed', data: { balance: 100 } } },
    errors: ['401', '500'],
  }),

  // ── Dev only ──────────────────────────────────────────────
  ep('post', '/v1/user/deletewithwalletaddress', {
    tag: 'User',
    summary: '[DEV] Delete all data for a wallet address',
    desc: 'Development-only endpoint. Deletes the user, their assets, planets, currency and transactions.',
    auth: 'none',
    encrypt: 'none',
    body: {
      required: ['walletAddress'],
      props: { walletAddress: P('string', 'Wallet address to wipe', { ex: '0x1a...' }) },
      example: { walletAddress: '0x1a...' },
    },
    success: { code: 200, message: 'deleted', example: { statusCode: 200, status: true, message: 'deleted' } },
    errors: ['404', '500'],
  }),
];

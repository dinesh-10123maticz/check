const { ep, P } = require('./common');

/**
 * ─────────────────────────────────────────────────────────────
 * GAME MODULE  (mounted at /v1/game)
 * Image/IPFS uploads, user assets, buildings, ships, training,
 * packs, crews, inventory, admin price updates.
 * ─────────────────────────────────────────────────────────────
 */

/** Fields for IPFS v2 validations (planet/asteroid) */
const ipfsV2Body = {
  planetId: P('string', 'Planet _id (required)'),
  WalletAddress: P('string', 'Wallet address (required, must match ^0x[a-f0-9]{40}$)'),
  priceType: P('string', 'coin | token (required)', { e: ['coin', 'token'], ex: 'coin' }),
  symbol: P('string', 'Token symbol (required when priceType=token; must match ^[A-Z0-9]{2,10}$)', { ex: 'GALFI' }),
};

module.exports = [
  // ── Uploads & IPFS ────────────────────────────────────────
  ep('post', '/v1/game/uploadimage', {
    tag: 'Game',
    summary: 'Generic image upload → returns URL',
    auth: 'none',
    body: {
      required: ['location', 'fileName'],
      props: {
        location: P('string', 'S3 folder key', { ex: 'gameassets' }),
        fileName: P('string', 'File name', { ex: 'planet1.png' }),
      },
      example: { location: 'gameassets', fileName: 'planet1.png' },
    },
    success: { code: 200, message: 'uploaded', example: { statusCode: 200, status: true, message: 'uploaded', data: { url: 'https://cdn.galfi.com/gameassets/planet1.png' } } },
    errors: ['400', '500'],
  }),

  ep('post', '/v1/game/initipfs', {
    tag: 'Game',
    summary: 'Initialize IPFS mint for a planet',
    desc: 'Yup validation: `planetId`, `WalletAddress` required.',
    auth: 'game-jwt',
    body: {
      required: ['planetId', 'WalletAddress'],
      props: {
        planetId: P('string', 'Planet _id'),
        WalletAddress: P('string', 'Wallet address'),
      },
      example: { planetId: '66e...', WalletAddress: '0x1a...' },
    },
    success: { code: 200, message: 'initialized', example: { statusCode: 200, status: true, message: 'initialized', data: { ipfs: 'ipfs://...' } } },
    errors: ['400', '401', '500'],
  }),

  ep('get', '/v1/game/ipfs/planetAsteroidType', {
    tag: 'Game',
    summary: 'Get planet/asteroid asset types for IPFS mint',
    auth: 'game-jwt',
    params: [
      { name: 'type', in: 'query', required: false, t: 'string', d: 'planet | asteroid' },
      { name: 'page', in: 'query', required: false, t: 'integer', ex: 1 },
      { name: 'limit', in: 'query', required: false, t: 'integer', ex: 10 },
    ],
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [{ _id: '66e...', name: 'Earth' }] } },
    errors: ['401', '500'],
  }),

  ep('post', '/v1/game/ipfs/planet', {
    tag: 'Game',
    summary: 'Mint planet metadata to IPFS (v2)',
    desc: 'Strict yup validation (no unknown fields): planetId, WalletAddress, priceType (coin|token), symbol when priceType=token.',
    auth: 'game-jwt',
    body: { required: ['planetId', 'WalletAddress', 'priceType'], props: ipfsV2Body, example: { planetId: '66e...', WalletAddress: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b', priceType: 'coin' } },
    success: { code: 200, message: 'minted', example: { statusCode: 200, status: true, message: 'minted', data: { ipfs: 'ipfs://...' } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/game/ipfs/asteroid', {
    tag: 'Game',
    summary: 'Mint asteroid metadata to IPFS (v2)',
    desc: 'Same strict validation as `/ipfs/planet`.',
    auth: 'game-jwt',
    body: { required: ['planetId', 'WalletAddress', 'priceType'], props: ipfsV2Body, example: { planetId: '66e...', WalletAddress: '0x1a...', priceType: 'token', symbol: 'GALFI' } },
    success: { code: 200, message: 'minted', example: { statusCode: 200, status: true, message: 'minted', data: { ipfs: 'ipfs://...' } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/game/ipfs/ship', {
    tag: 'Game',
    summary: 'Initialize IPFS mint for a ship (v2)',
    auth: 'game-jwt',
    body: {
      required: ['shipId', 'WalletAddress'],
      props: {
        shipId: P('string', 'Ship _id'),
        WalletAddress: P('string', 'Wallet address'),
        priceType: P('string', 'coin | token'),
        symbol: P('string', 'Token symbol'),
      },
      example: { shipId: '66c...', WalletAddress: '0x1a...', priceType: 'coin' },
    },
    success: { code: 200, message: 'minted', example: { statusCode: 200, status: true, message: 'minted', data: { ipfs: 'ipfs://...' } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/game/initipfsforcrew', {
    tag: 'Game',
    summary: 'Initialize IPFS mint for a crew',
    auth: 'game-jwt',
    body: {
      required: ['crewId'],
      props: { crewId: P('string', 'Crew asset _id') },
      example: { crewId: '66f...' },
    },
    success: { code: 200, message: 'initialized', example: { statusCode: 200, status: true, message: 'initialized', data: { ipfs: 'ipfs://...' } } },
    errors: ['400', '401', '404', '500'],
  }),

  ep('post', '/v1/game/ipfs/crew', {
    tag: 'Game',
    summary: 'Mint crew metadata to IPFS',
    auth: 'game-jwt',
    body: {
      required: ['crewId'],
      props: {
        crewId: P('string', 'Crew asset _id'),
        priceType: P('string', 'coin | token'),
        symbol: P('string', 'Token symbol'),
      },
      example: { crewId: '66f...', priceType: 'coin' },
    },
    success: { code: 200, message: 'minted', example: { statusCode: 200, status: true, message: 'minted', data: { ipfs: 'ipfs://...' } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/game/ipfs/specialcrew', {
    tag: 'Game',
    summary: 'Mint special crew metadata to IPFS',
    desc: 'Yup validation via `specialcrew_validation`.',
    auth: 'game-jwt',
    body: {
      required: ['crewId'],
      props: {
        crewId: P('string', 'Crew asset _id'),
        priceType: P('string', 'coin | token'),
        symbol: P('string', 'Token symbol'),
      },
      example: { crewId: '66f...', priceType: 'token', symbol: 'GALFI' },
    },
    success: { code: 200, message: 'minted', example: { statusCode: 200, status: true, message: 'minted', data: { ipfs: 'ipfs://...' } } },
    errors: ['400', '401', '500'],
  }),

  // ── Assets & planets ──────────────────────────────────────
  ep('post', '/v1/game/nft/gameinfo', {
    tag: 'Game',
    summary: 'Get game info of an NFT (marketplace helper)',
    auth: 'none',
    body: {
      required: ['NFTId'],
      props: { NFTId: P('string', 'NFT id') },
      example: { NFTId: '66a...' },
    },
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { gameInfo: {} } } },
    errors: ['400', '500'],
  }),

  ep('post', '/v1/game/assetbyplanetid', {
    tag: 'Game',
    summary: 'Get asset by planet id',
    auth: 'none',
    body: {
      required: ['userPlanetId'],
      props: { userPlanetId: P('string', 'User planet _id') },
      example: { userPlanetId: '66g...' },
    },
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: {} } },
    errors: ['400', '500'],
  }),

  ep('post', '/v1/game/assetshop', {
    tag: 'Game',
    summary: 'Asset shop (buildings for sale)',
    auth: 'none',
    body: {
      required: [],
      props: {
        page: P('integer', 'Page', { ex: 1 }),
        limit: P('integer', 'Per page', { ex: 12 }),
      },
      example: { page: 1, limit: 12 },
    },
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { items: [], totalCount: 0 } } },
    errors: ['400', '500'],
  }),

  ep('post', '/v1/game/createuserasset', {
    tag: 'Game',
    summary: 'Buy / place a building on a user planet',
    desc: 'Yup validation: `build_Number`, `walletAddress`, `userPlanetId`, `assetId`, `asset_name`, `x`, `y` required.',
    auth: 'none',
    body: {
      required: ['build_Number', 'walletAddress', 'userPlanetId', 'assetId', 'asset_name', 'x', 'y'],
      props: {
        build_Number: P('string', 'Building number', { ex: 'B001' }),
        walletAddress: P('string', 'Wallet address'),
        userPlanetId: P('string', 'User planet _id'),
        assetId: P('string', 'Building asset _id'),
        asset_name: P('string', 'Asset name', { ex: 'House' }),
        x: P('number', 'X coordinate', { ex: 10 }),
        y: P('number', 'Y coordinate', { ex: 20 }),
      },
      example: { build_Number: 'B001', walletAddress: '0x1a...', userPlanetId: '66g...', assetId: '66e...', asset_name: 'House', x: 10, y: 20 },
    },
    success: { code: 200, message: 'created', example: { statusCode: 200, status: true, message: 'created', data: { _id: '66h...' } } },
    errors: ['400', '500'],
  }),

  ep('get', '/v1/game/userassetlist', {
    tag: 'Game',
    summary: 'Get user assets (buildings) list',
    desc: 'Yup validation via `userAsset_validation`.',
    auth: 'game-jwt',
    params: [
      { name: 'userPlanetId', in: 'query', required: true, t: 'string', d: 'User planet _id' },
      { name: 'page', in: 'query', required: false, t: 'integer', ex: 1 },
      { name: 'limit', in: 'query', required: false, t: 'integer', ex: 10 },
    ],
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [{ _id: '66h...', asset_name: 'House' }] } },
    errors: ['400', '401', '500'],
  }),

  ep('get', '/v1/game/planetlist', {
    tag: 'Game',
    summary: 'Get planet list (public)',
    auth: 'none',
    params: [
      { name: 'page', in: 'query', required: false, t: 'integer', ex: 1 },
      { name: 'limit', in: 'query', required: false, t: 'integer', ex: 12 },
    ],
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [{ _id: '66e...', name: 'Earth' }] } },
    errors: ['500'],
  }),

  ep('post', '/v1/game/userassetlevelup', {
    tag: 'Game',
    summary: 'Level up a user asset',
    auth: 'game-jwt',
    body: {
      required: ['build_Number', 'planetId', 'nextLevelId'],
      props: {
        build_Number: P('string', 'Building number'),
        planetId: P('string', 'User planet _id'),
        nextLevelId: P('string', 'Next level _id'),
        pricetype: P('string', 'Price type'),
        optionalCost: P('array', 'Optional costs'),
      },
      example: { build_Number: 'B001', planetId: '66g...', nextLevelId: '66i...' },
    },
    success: { code: 200, message: 'leveled up', example: { statusCode: 200, status: true, message: 'leveled up', data: {} } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/game/claimreward', {
    tag: 'Game',
    summary: 'Claim building reward',
    desc: 'Yup validation: `build_Number` required.',
    auth: 'game-jwt',
    body: {
      required: ['build_Number'],
      props: { build_Number: P('string', 'Building number') },
      example: { build_Number: 'B001' },
    },
    success: { code: 200, message: 'claimed', example: { statusCode: 200, status: true, message: 'claimed', data: { reward: 50 } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/game/useconsumable', {
    tag: 'Game',
    summary: 'Use a consumable',
    desc: 'Yup validation: `build_Number` required.',
    auth: 'game-jwt',
    body: {
      required: ['build_Number'],
      props: {
        build_Number: P('string', 'Building number'),
        days: P('integer', 'Number of days', { ex: 1 }),
      },
      example: { build_Number: 'B001', days: 1 },
    },
    success: { code: 200, message: 'used', example: { statusCode: 200, status: true, message: 'used' } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/game/claimallreward', {
    tag: 'Game',
    summary: 'Claim all building rewards',
    auth: 'game-jwt',
    body: {
      required: ['userPlanetId'],
      props: { userPlanetId: P('string', 'User planet _id') },
      example: { userPlanetId: '66g...' },
    },
    success: { code: 200, message: 'claimed', example: { statusCode: 200, status: true, message: 'claimed', data: { totalReward: 150 } } },
    errors: ['400', '401', '500'],
  }),

  ep('get', '/v1/game/planetrewards', {
    tag: 'Game',
    summary: 'Get planet rewards',
    desc: 'Yup validation via `userAsset_validation`.',
    auth: 'game-jwt',
    params: [
      { name: 'userPlanetId', in: 'query', required: true, t: 'string', d: 'User planet _id' },
    ],
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [] } },
    errors: ['400', '401', '500'],
  }),

  ep('get', '/v1/game/buildinglist', {
    tag: 'Game',
    summary: 'Get building list for the user',
    auth: 'game-jwt',
    params: [
      { name: 'page', in: 'query', required: false, t: 'integer', ex: 1 },
      { name: 'limit', in: 'query', required: false, t: 'integer', ex: 12 },
    ],
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [{ _id: '66e...', asset_Name: 'House' }] } },
    errors: ['401', '500'],
  }),

  // ── Ships ─────────────────────────────────────────────────
  ep('get', '/v1/game/shipshop', {
    tag: 'Game',
    summary: 'Ship shop',
    auth: 'game-jwt',
    params: [
      { name: 'page', in: 'query', required: false, t: 'integer', ex: 1 },
      { name: 'limit', in: 'query', required: false, t: 'integer', ex: 12 },
      { name: 'allowMission', in: 'query', required: false, t: 'boolean', d: 'Only mission ships' },
    ],
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { items: [], totalCount: 0 } } },
    errors: ['401', '500'],
  }),

  ep('get', '/v1/game/shiplist', {
    tag: 'Game',
    summary: 'Get all ship types',
    auth: 'none',
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [{ _id: '66c...', shipName: 'Voyager' }] } },
    errors: ['500'],
  }),

  ep('post', '/v1/game/shipformission', {
    tag: 'Game',
    summary: 'Get ships available for a mission',
    auth: 'game-jwt',
    body: {
      required: ['hexId'],
      props: {
        hexId: P('string', 'Hex id'),
        type: P('string', 'Ship type'),
      },
      example: { hexId: '7' },
    },
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [] } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/game/equipship', {
    tag: 'Game',
    summary: 'Equip a ship',
    auth: 'game-jwt',
    body: {
      required: ['shipId'],
      props: {
        shipId: P('string', 'User ship _id'),
        priceType: P('string', 'Price type'),
        symbol: P('string', 'Symbol'),
        hexId: P('string', 'Hex id'),
        optionalCost: P('array', 'Optional costs'),
        costType: P('string', 'Cost type'),
        buildingId: P('string', 'Building id'),
        planetId: P('string', 'Planet id'),
      },
      example: { shipId: '66c...', hexId: '7' },
    },
    success: { code: 200, message: 'equipped', example: { statusCode: 200, status: true, message: 'equipped' } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/game/getbackship', {
    tag: 'Game',
    summary: 'Unequip / get ship back',
    auth: 'game-jwt',
    body: {
      required: ['shipId'],
      props: { shipId: P('string', 'User ship _id') },
      example: { shipId: '66c...' },
    },
    success: { code: 200, message: 'unequipped', example: { statusCode: 200, status: true, message: 'unequipped' } },
    errors: ['400', '401', '500'],
  }),

  // ── Training ──────────────────────────────────────────────
  ep('post', '/v1/game/training/add', {
    tag: 'Game',
    summary: 'Start crew training',
    auth: 'game-jwt',
    body: {
      required: ['nftIds'],
      props: { nftIds: P('array', 'NFT ids to train', { ex: ['66a...'] }) },
      example: { nftIds: ['66a...', '66b...'] },
    },
    success: { code: 200, message: 'training started', example: { statusCode: 200, status: true, message: 'training started', data: { trainings: [{ nftId: '66a...', endAt: 1724100000000 }] } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/game/training/claim', {
    tag: 'Game',
    summary: 'Claim trained crew XP',
    auth: 'game-jwt',
    body: {
      required: ['id'],
      props: { id: P('string', 'Training _id') },
      example: { id: '66j...' },
    },
    success: { code: 200, message: 'claimed', example: { statusCode: 200, status: true, message: 'claimed', data: { xp: 20 } } },
    errors: ['400', '401', '404', '500'],
  }),

  ep('get', '/v1/game/training', {
    tag: 'Game',
    summary: 'Get crew in training',
    auth: 'game-jwt',
    params: [
      { name: 'status', in: 'query', required: false, t: 'string', d: 'Training status filter' },
    ],
    success: { code: 200, message: 'success', example: { statusCode: 200, status: true, message: 'success', data: [{ _id: '66j...', nftId: '66a...', endAt: 1724100000000 }] } },
    errors: ['401', '500'],
  }),

  // ── Packs ─────────────────────────────────────────────────
  ep('post', '/v1/game/pack', {
    tag: 'Game',
    summary: 'Create packs in a range',
    auth: 'none',
    body: {
      required: ['packNumberFrom', 'packNumberTo'],
      props: {
        packNumberFrom: P('integer', 'Start pack number (cannot be 0)', { ex: 1 }),
        packNumberTo: P('integer', 'End pack number', { ex: 100 }),
      },
      example: { packNumberFrom: 1, packNumberTo: 100 },
    },
    success: { code: 200, message: 'pack created', example: { statusCode: 200, status: true, message: 'pack created', data: [] } },
    errors: ['400', '500'],
  }),

  ep('get', '/v1/game/pack', {
    tag: 'Game',
    summary: 'Get packs',
    auth: 'none',
    params: [
      { name: 'page', in: 'query', required: false, t: 'integer', ex: 1 },
      { name: 'limit', in: 'query', required: false, t: 'integer', ex: 12 },
    ],
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [{ _id: '66k...', packNumber: 1 }] } },
    errors: ['500'],
  }),

  ep('post', '/v1/game/add/pack', {
    tag: 'Game',
    summary: 'Add a pack to an asset (building)',
    auth: 'none',
    body: {
      required: ['packNumber', 'assetName'],
      props: {
        packNumber: P('integer', 'Pack number'),
        assetName: P('string', 'Asset name'),
        imageurl: P('string', 'Image URL'),
        hullPoints: P('number', 'Hull points'),
        description: P('string', 'Description'),
      },
      example: { packNumber: 1, assetName: 'Event Tower', imageurl: 'https://.../tower.png' },
    },
    success: { code: 200, message: 'added', example: { statusCode: 200, status: true, message: 'added', data: {} } },
    errors: ['400', '409', '500'],
  }),

  ep('post', '/v1/game/update/pack/planetassets', {
    tag: 'Game',
    summary: 'Assign a pack to planet/asteroid assets',
    auth: 'none',
    body: {
      required: ['packNumber', 'ids'],
      props: {
        packNumber: P('integer', 'Pack number'),
        ids: P('array', 'Planet asset ids', { ex: ['66e...'] }),
      },
      example: { packNumber: 1, ids: ['66e...'] },
    },
    success: { code: 200, message: 'pack updated for the planets', example: { statusCode: 200, status: true, message: 'pack updated for the planets', data: {} } },
    errors: ['400', '409', '500'],
  }),

  // ── Crews ─────────────────────────────────────────────────
  ep('get', '/v1/game/crew/crewlist', {
    tag: 'Game',
    summary: 'Get crew list',
    auth: 'none',
    params: [
      { name: 'page', in: 'query', required: false, t: 'integer', ex: 1 },
      { name: 'limit', in: 'query', required: false, t: 'integer', ex: 12 },
      { name: 'crewType', in: 'query', required: false, t: 'string', d: 'crew | galficrew | galfispecialcrew' },
    ],
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [{ _id: '66f...', name: 'Pilot' }] } },
    errors: ['500'],
  }),

  ep('get', '/v1/game/crew/:id', {
    tag: 'Game',
    summary: 'Get crew by id',
    auth: 'none',
    params: [{ name: 'id', in: 'path', required: true, t: 'string', d: 'Crew asset _id' }],
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { _id: '66f...', name: 'Pilot' } } },
    errors: ['404', '500'],
  }),

  ep('post', '/v1/game/crew/addcrew', {
    tag: 'Game',
    summary: 'Add a crew NFT asset',
    desc: 'Yup validation via `createCrew_val`.',
    auth: 'none',
    body: {
      required: ['name', 'crewType', 'rarity', 'imageKey', 'gender'],
      props: {
        name: P('string', 'Crew name'),
        crewType: P('string', 'crew | galficrew | galfispecialcrew'),
        rarity: P('string', 'common | uncommon | rare'),
        imageKey: P('string', 'Image key'),
        price: P('array', 'Price entries'),
        gender: P('string', 'male | female'),
        collectionId: P('string', 'Collection _id'),
        profession: P('string', 'Profession'),
        NFTProperties: P('array', 'Trait properties'),
      },
      example: { name: 'Pilot Ace', crewType: 'crew', rarity: 'rare', imageKey: 'crew/1.png', gender: 'male' },
    },
    success: { code: 200, message: 'created', example: { statusCode: 200, status: true, message: 'created', data: { _id: '66f...' } } },
    errors: ['400', '500'],
  }),

  // ── Inventory ─────────────────────────────────────────────
  ep('post', '/v1/game/userinventory', {
    tag: 'Game',
    summary: 'Get user inventory',
    auth: 'game-jwt',
    body: {
      required: [],
      props: {
        page: P('integer', 'Page', { ex: 1 }),
        limit: P('integer', 'Per page', { ex: 12 }),
      },
      example: { page: 1, limit: 12 },
    },
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [] } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/game/moveinventory', {
    tag: 'Game',
    summary: 'Move asset to/from inventory',
    auth: 'game-jwt',
    body: {
      required: ['userPlanetId'],
      props: {
        userPlanetId: P('string', 'User planet _id'),
        assetId: P('string', 'Asset _id'),
      },
      example: { userPlanetId: '66g...', assetId: '66h...' },
    },
    success: { code: 200, message: 'moved', example: { statusCode: 200, status: true, message: 'moved' } },
    errors: ['400', '401', '500'],
  }),

  ep('put', '/v1/game/isquote', {
    tag: 'Game',
    summary: 'Mark quote as read',
    auth: 'game-jwt',
    body: {
      required: [],
      props: {},
      example: {},
    },
    success: { code: 200, message: 'updated', example: { statusCode: 200, status: true, message: 'updated' } },
    errors: ['400', '401', '500'],
  }),

  // ── Admin (game module) ───────────────────────────────────
  ep('post', '/v1/game/admin/assetsforairdrop', {
    tag: 'Game',
    summary: 'Fetch assets for airdrop (admin)',
    auth: 'admin',
    body: {
      required: [],
      props: {
        type: P('string', 'Asset type'),
        page: P('integer', 'Page'),
        limit: P('integer', 'Per page'),
      },
      example: { type: 'planet', page: 1, limit: 10 },
    },
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [] } },
    errors: ['400', '401', '500'],
  }),

  ep('put', '/v1/game/v2/admin/crew/price', {
    tag: 'Game',
    summary: 'Update crew price (admin v2)',
    auth: 'admin',
    body: {
      required: ['crewId'],
      props: {
        crewId: P('string', 'Crew asset _id'),
        price: P('array', 'New price entries'),
      },
      example: { crewId: '66f...', price: [{ label: 'GALFI', amount: 250 }] },
    },
    success: { code: 200, message: 'updated', example: { statusCode: 200, status: true, message: 'updated' } },
    errors: ['400', '401', '500'],
  }),

  ep('get', '/v1/game/admin/crew/price', {
    tag: 'Game',
    summary: 'Get crew price (admin)',
    auth: 'admin',
    params: [
      { name: 'crewId', in: 'query', required: false, t: 'string', d: 'Crew asset _id' },
    ],
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [] } },
    errors: ['401', '500'],
  }),

  ep('put', '/v1/game/admin/planet/price', {
    tag: 'Game',
    summary: 'Update planet/asteroid price (admin)',
    auth: 'admin',
    body: {
      required: ['assetId'],
      props: {
        assetId: P('string', 'Planet/asteroid asset _id'),
        price: P('array', 'New price entries'),
      },
      example: { assetId: '66e...', price: [{ label: 'GALFI', amount: 100 }] },
    },
    success: { code: 200, message: 'updated', example: { statusCode: 200, status: true, message: 'updated' } },
    errors: ['400', '401', '500'],
  }),

  ep('get', '/v1/game/admin/planet/price', {
    tag: 'Game',
    summary: 'Get planet/asteroid price (admin)',
    auth: 'admin',
    params: [
      { name: 'assetId', in: 'query', required: false, t: 'string', d: 'Asset _id' },
    ],
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [] } },
    errors: ['401', '500'],
  }),

  ep('put', '/v1/game/ship/admin/update', {
    tag: 'Game',
    summary: 'Update ship (admin)',
    auth: 'admin',
    body: {
      required: ['_id'],
      props: {
        _id: P('string', 'Ship _id'),
        shipName: P('string', 'Ship name'),
        shipType: P('string', 'Ship type'),
        price: P('array', 'Price entries'),
        image: P('string', 'Image key'),
      },
      example: { _id: '66c...', shipName: 'Voyager X' },
    },
    success: { code: 200, message: 'updated', example: { statusCode: 200, status: true, message: 'updated' } },
    errors: ['400', '401', '500'],
  }),

  ep('put', '/v1/game/ship/admin/update/price', {
    tag: 'Game',
    summary: 'Update ship price (admin)',
    auth: 'admin',
    body: {
      required: ['_id'],
      props: {
        _id: P('string', 'Ship _id'),
        price: P('array', 'New price entries'),
      },
      example: { _id: '66c...', price: [{ label: 'GALFI', amount: 600 }] },
    },
    success: { code: 200, message: 'updated', example: { statusCode: 200, status: true, message: 'updated' } },
    errors: ['400', '401', '500'],
  }),

  // ── Dev / restricted routes ───────────────────────────────
  ep('get', '/v1/game/v3/dev/build/auto/asset/level', {
    tag: 'Game',
    summary: '[DEV] Auto-generate asset levels',
    desc: 'Restricted: returns 403 in production.',
    auth: 'none',
    params: [
      { name: 'assetId', in: 'query', required: false, t: 'string', d: 'Asset _id' },
      { name: 'levelLimit', in: 'query', required: false, t: 'integer', d: 'Max level to generate' },
    ],
    success: { code: 200, message: 'generated', example: { statusCode: 200, status: true, message: 'generated' } },
    errors: ['403', '500'],
  }),

  ep('get', '/v1/game/build/buildinglist', {
    tag: 'Game',
    summary: '[DEV] Building list',
    desc: 'Restricted: returns 403 in production.',
    auth: 'none',
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [] } },
    errors: ['403', '500'],
  }),

  ep('post', '/v1/game/build/addasset', {
    tag: 'Game',
    summary: '[DEV] Add a building asset',
    desc: 'Restricted: returns 403 in production. Multipart `image` file optional.',
    auth: 'none',
    body: {
      required: ['name', 'rows', 'columns', 'levelLimit'],
      props: {
        name: P('string', 'Asset name'),
        rows: P('integer', 'Grid rows'),
        columns: P('integer', 'Grid columns'),
        levelLimit: P('integer', 'Max level'),
        commonPlanetBuildLimit: P('integer', 'Build limit on common planets'),
        unCommonPlanetBuildLimit: P('integer', 'Build limit on uncommon planets'),
        rarePlanetBuildLimit: P('integer', 'Build limit on rare planets'),
        specialConditions: P('string', 'Special conditions'),
        cost: P('array', 'Cost entries'),
        AttackPoints: P('number', 'Attack points'),
        HullPoints: P('number', 'Hull points'),
        optionalCost: P('array', 'Optional costs'),
        dailyConsumption: P('array', 'Daily consumption'),
        build_time_min: P('number', 'Build time in minutes'),
        image: P('file', 'Image file (multipart)'),
      },
      example: { name: 'House', rows: 2, columns: 2, levelLimit: 5, build_time_min: 60 },
    },
    success: { code: 200, message: 'created', example: { statusCode: 200, status: true, message: 'created', data: { _id: '66e...' } } },
    errors: ['400', '403', '409', '500'],
  }),

  ep('post', '/v1/game/build/addlevel', {
    tag: 'Game',
    summary: '[DEV] Add a level to a building',
    desc: 'Restricted: 403 in production. Yup validation via `addlevel_val`.',
    auth: 'none',
    body: {
      required: ['assetId', 'imageKey', 'level'],
      props: {
        assetId: P('string', 'Asset _id'),
        imageKey: P('string', 'Level image key'),
        level: P('integer', 'Level number'),
        description: P('string', 'Description'),
        specialConditions: P('string', 'Special conditions'),
        Blocks: P('array', 'Blocks'),
        reward: P('array', 'Rewards'),
        cost: P('array', 'Costs'),
        dailyConsumption: P('array', 'Daily consumption'),
        optionalCost: P('array', 'Optional costs'),
        HullPoints: P('number', 'Hull points'),
        AttackPoints: P('number', 'Attack points'),
        build_time_min: P('number', 'Build time'),
      },
      example: { assetId: '66e...', imageKey: 'building/original/house/2.png', level: 2 },
    },
    success: { code: 200, message: 'created', example: { statusCode: 200, status: true, message: 'created', data: { _id: '66i...' } } },
    errors: ['400', '403', '409', '500'],
  }),

  ep('post', '/v1/game/build/autoaddlevel', {
    tag: 'Game',
    summary: '[DEV] Auto-add all levels for an asset',
    desc: 'Restricted: 403 in production. Yup validation via `autoaddlevel_val`.',
    auth: 'none',
    body: {
      required: ['assetId', 'imagePath'],
      props: {
        assetId: P('string', 'Asset _id'),
        imagePath: P('string', 'Image path prefix'),
        levelLimit: P('integer', 'Max level'),
      },
      example: { assetId: '66e...', imagePath: 'building/original/house/', levelLimit: 5 },
    },
    success: { code: 200, message: 'generated', example: { statusCode: 200, status: true, message: 'generated', data: [] } },
    errors: ['400', '403', '409', '500'],
  }),

  ep('post', '/v1/game/build/editassetlevel', {
    tag: 'Game',
    summary: '[DEV] Edit an asset level',
    desc: 'Restricted: 403 in production.',
    auth: 'none',
    body: {
      required: ['assetId'],
      props: {
        assetId: P('string', 'Asset _id'),
        level: P('integer', 'Level'),
        imageKey: P('string', 'Image key'),
        description: P('string', 'Description'),
        reward: P('array', 'Rewards'),
        cost: P('array', 'Costs'),
      },
      example: { assetId: '66e...', level: 2, imageKey: 'building/original/house/2.png' },
    },
    success: { code: 200, message: 'updated', example: { statusCode: 200, status: true, message: 'updated' } },
    errors: ['400', '403', '409', '500'],
  }),

  ep('post', '/v1/game/dev/createship', {
    tag: 'Game',
    summary: '[DEV] Create a ship',
    desc: 'Restricted: 403 in production.',
    auth: 'none',
    body: {
      required: ['shipName'],
      props: {
        shipName: P('string', 'Ship name'),
        shipType: P('string', 'Ship type'),
        capacity: P('number', 'Capacity'),
        canBuylimit: P('integer', 'Buy limit'),
        rarity: P('string', 'Rarity'),
        price: P('array', 'Price entries'),
        attackPoints: P('number', 'Attack points'),
        hullPoints: P('number', 'Hull points'),
        specialConditions: P('string', 'Special conditions'),
        extraReward: P('array', 'Extra rewards'),
        nftSlots: P('integer', 'NFT slots'),
        imageKey: P('string', 'Image key'),
      },
      example: { shipName: 'Voyager', shipType: 'explorer', price: [{ label: 'GALFI', amount: 500 }] },
    },
    success: { code: 200, message: 'created', example: { statusCode: 200, status: true, message: 'created', data: { _id: '66c...' } } },
    errors: ['400', '403', '500'],
  }),

  ep('post', '/v1/game/crew/auto', {
    tag: 'Game',
    summary: '[DEV] Auto-insert crews',
    desc: 'Restricted: 403 in production.',
    auth: 'none',
    body: {
      required: [],
      props: {
        count: P('integer', 'Number of crews to insert'),
        gender: P('string', 'male | female'),
      },
      example: { count: 100, gender: 'male' },
    },
    success: { code: 200, message: 'inserted', example: { statusCode: 200, status: true, message: 'inserted' } },
    errors: ['403', '500'],
  }),

  ep('post', '/v1/game/deletalluserasset', {
    tag: 'Game',
    summary: '[DEV] Delete all user assets',
    desc: 'Restricted: 403 in production.',
    auth: 'none',
    body: {
      required: ['walletAddress'],
      props: { walletAddress: P('string', 'Wallet address') },
      example: { walletAddress: '0x1a...' },
    },
    success: { code: 200, message: 'deleted', example: { statusCode: 200, status: true, message: 'deleted' } },
    errors: ['403', '500'],
  }),

  ep('post', '/v1/game/deleteassetbyuserplanet', {
    tag: 'Game',
    summary: '[DEV] Delete assets by user planet',
    desc: 'Restricted: 403 in production.',
    auth: 'none',
    body: {
      required: ['userPlanetId'],
      props: { userPlanetId: P('string', 'User planet _id') },
      example: { userPlanetId: '66g...' },
    },
    success: { code: 200, message: 'deleted', example: { statusCode: 200, status: true, message: 'deleted' } },
    errors: ['403', '500'],
  }),

  ep('post', '/v1/game/pack/tempchange', {
    tag: 'Game',
    summary: '[DEV] Temp-change pack for all planets',
    desc: 'Restricted: 403 in production.',
    auth: 'none',
    body: {
      required: ['packNumber'],
      props: { packNumber: P('integer', 'Pack number') },
      example: { packNumber: 1 },
    },
    success: { code: 200, message: 'pack updated for the planets', example: { statusCode: 200, status: true, message: 'pack updated for the planets' } },
    errors: ['403', '409', '500'],
  }),
];

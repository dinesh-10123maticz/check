const { ep, P } = require('./common');

/**
 * ─────────────────────────────────────────────────────────────
 * NFT MODULE  (mounted at /v1/nft)
 * Marketplace: explore, orders, bids, collections, game NFTs.
 * ─────────────────────────────────────────────────────────────
 */
module.exports = [
  // ── NFT creation & validation ─────────────────────────────
  ep('post', '/v1/nft/validatetokenname', {
    tag: 'NFT',
    summary: 'Check whether an NFT name is already taken',
    auth: 'user',
    body: {
      required: ['NFTName'],
      props: { NFTName: P('string', 'NFT name to validate', { ex: 'Galaxy #1' }) },
      example: { NFTName: 'Galaxy #1' },
    },
    success: { code: 200, message: 'fetched', example: { status: true, message: 'fetched', data: { available: true } } },
    errors: ['400', '401', '409', '500'],
  }),

  ep('post', '/v1/nft/createnft', {
    tag: 'NFT',
    summary: 'Create a new NFT (mint metadata + ownership)',
    desc: 'Creates the NFT record with metadata, images, sale settings and owner.',
    auth: 'none',
    body: {
      required: ['NFTName', 'CollectionNetwork', 'ContractAddress', 'ContractType', 'NFTOwner'],
      props: {
        CollectionNetwork: P('string', 'Network the collection lives on', { ex: 'polygon' }),
        CollectionName: P('string', 'Collection name', { ex: 'Galaxy Planets' }),
        CollectionSymbol: P('string', 'Collection symbol', { ex: 'GALAXY' }),
        NFTId: P('string', 'On-chain NFT token id', { ex: '1001' }),
        NFTName: P('string', 'NFT name', { ex: 'Galaxy #1001' }),
        Category: P('string', 'Category name', { ex: 'planet' }),
        NFTDescription: P('string', 'Description', { ex: 'Rare desert planet' }),
        NFTOrginalImage: P('string', 'Original image key/URL'),
        NFTThumpImage: P('string', 'Thumbnail image key/URL'),
        UnlockContent: P('string', 'Unlockable content'),
        ContractAddress: P('string', 'Collection contract address', { ex: '0x...' }),
        ContractType: P('string', 'Contract type', { ex: 'planet' }),
        NFTRoyalty: P('number', 'Royalty percentage', { ex: 5 }),
        NFTProperties: P('array', 'Trait properties', { ex: [{ trait: 'Rarity', value: 'Rare' }] }),
        CompressedFile: P('string', 'Compressed file key'),
        CompressedThumbFile: P('string', 'Compressed thumbnail key'),
        NFTOrginalImageIpfs: P('string', 'IPFS URL of original image'),
        NFTThumpImageIpfs: P('string', 'IPFS URL of thumbnail'),
        MetaData: P('object', 'Metadata object'),
        MetFile: P('string', 'Metadata file key'),
        NFTCreator: P('string', 'Creator wallet address'),
        NFTQuantity: P('integer', 'Quantity', { ex: 1 }),
        PutOnSale: P('boolean', 'Whether listed for sale', { ex: true }),
        PutOnSaleType: P('string', 'Sale type (fixed/auction)', { ex: 'fixed' }),
        NFTPrice: P('number', 'Sale price', { ex: 100 }),
        CoinName: P('string', 'Pricing token symbol', { ex: 'GALFI' }),
        ClockTime: P('integer', 'Start time (ms)'),
        EndClockTime: P('integer', 'End time (ms)'),
        HashValue: P('string', 'Transaction hash'),
        NFTOwner: P('string', 'Owner wallet address'),
        activity: P('array', 'Activity log entries'),
        NFTBalance: P('number', 'Owner balance', { ex: 1 }),
        LazyStatus: P('boolean', 'Lazy mint flag'),
        NonceHash: P('string', 'Nonce hash'),
        RandomName: P('string', 'Random name'),
        SignatureHash: P('string', 'Signature hash'),
      },
      example: {
        NFTName: 'Galaxy #1001', CollectionNetwork: 'polygon', ContractAddress: '0x...',
        ContractType: 'planet', NFTOwner: '0x1a...', NFTPrice: 100, CoinName: 'GALFI',
        NFTQuantity: 1, NFTOrginalImage: 'nft/original/1001.png', NFTThumpImage: 'nft/thumb/1001.png',
      },
    },
    success: { code: 200, message: 'Success', example: { status: true, message: 'Success', data: { _id: '665f1a...', NFTName: 'Galaxy #1001' } } },
    errors: ['400', '409', '500'],
  }),

  // ── Explore / search / lists ──────────────────────────────
  ep('get', '/v1/nft/Tokenlistfunexplore', {
    tag: 'NFT',
    summary: 'Explore NFT listings (marketplace)',
    auth: 'none',
    params: [
      { name: 'TabName', in: 'query', required: false, t: 'string', d: 'Tab: owned | onsale | created | All', ex: 'All' },
      { name: 'limit', in: 'query', required: false, t: 'integer', d: 'Items per page', ex: 12 },
      { name: 'page', in: 'query', required: false, t: 'integer', d: 'Page number', ex: 1 },
      { name: 'CustomUrl', in: 'query', required: false, t: 'string', d: 'Filter by user custom URL' },
      { name: 'from', in: 'query', required: false, t: 'string', d: 'Source context' },
      { name: 'filter', in: 'query', required: false, t: 'string', d: 'Filter key e.g. LatestDrops', ex: 'LatestDrops' },
      { name: 'pricerange', in: 'query', required: false, t: 'string', d: 'Price range filter' },
    ],
    success: { code: 200, message: 'fetched', encrypted: true, example: { status: true, message: 'fetched', data: [{ _id: '66a...', NFTName: 'Galaxy #1001', NFTPrice: 100 }] } },
    errors: ['400', '500'],
  }),

  ep('get', '/v1/nft/Tokenlistfuncollection', {
    tag: 'NFT',
    summary: 'Explore collections',
    auth: 'none',
    params: [
      { name: 'TabName', in: 'query', required: false, t: 'string', ex: 'All' },
      { name: 'limit', in: 'query', required: false, t: 'integer', ex: 12 },
      { name: 'page', in: 'query', required: false, t: 'integer', ex: 1 },
      { name: 'CustomUrl', in: 'query', required: false, t: 'string' },
      { name: 'from', in: 'query', required: false, t: 'string' },
      { name: 'filter', in: 'query', required: false, t: 'string' },
    ],
    success: { code: 200, message: 'fetched', encrypted: true, example: { status: true, message: 'fetched', data: [{ _id: '66a...', CollectionName: 'Galaxy Planets' }] } },
    errors: ['400', '500'],
  }),

  ep('get', '/v1/nft/Tokenlistfunacution', {
    tag: 'NFT',
    summary: 'Explore auctions (live bids)',
    auth: 'none',
    params: [
      { name: 'TabName', in: 'query', required: false, t: 'string' },
      { name: 'limit', in: 'query', required: false, t: 'integer', ex: 12 },
      { name: 'page', in: 'query', required: false, t: 'integer', ex: 1 },
      { name: 'CustomUrl', in: 'query', required: false, t: 'string' },
      { name: 'from', in: 'query', required: false, t: 'string' },
      { name: 'filter', in: 'query', required: false, t: 'string' },
    ],
    success: { code: 200, message: 'fetched', encrypted: true, example: { status: true, message: 'fetched', data: [{ _id: '66a...', NFTName: 'Galaxy #1001', EndClockTime: 1725000000000 }] } },
    errors: ['400', '500'],
  }),

  ep('get', '/v1/nft/SearchAction', {
    tag: 'NFT',
    summary: 'Search NFTs by keyword / class',
    auth: 'none',
    params: [
      { name: 'limit', in: 'query', required: false, t: 'integer', ex: 12 },
      { name: 'page', in: 'query', required: false, t: 'integer', ex: 1 },
      { name: 'from', in: 'query', required: false, t: 'string' },
      { name: 'Classid', in: 'query', required: false, t: 'string', d: 'Category/class _id' },
      { name: 'keyword', in: 'query', required: true, t: 'string', d: 'Search keyword (regex on NFT name)', ex: 'galaxy' },
    ],
    success: { code: 200, message: 'fetched', encrypted: true, example: { status: true, message: 'fetched', data: [{ _id: '66a...', NFTName: 'Galaxy #1001' }] } },
    errors: ['400', '500'],
  }),

  ep('post', '/v1/nft/myitemlist', {
    tag: 'NFT',
    summary: 'List the caller’s items (owned / on sale / created)',
    auth: 'none',
    body: {
      required: ['MyItemAddr'],
      props: {
        MyItemAddr: P('string', 'Owner wallet address'),
        ClickAddr: P('string', 'Profile wallet being viewed'),
        MyItemCustomUrl: P('string', 'Owner custom URL'),
        ClickCustomUrl: P('string', 'Viewed profile custom URL'),
        TabName: P('string', 'owned | onsale | created', { ex: 'owned' }),
        filter: P('string', 'Filter e.g. LatestDrops'),
        limit: P('integer', 'Items per page', { ex: 12 }),
        page: P('integer', 'Page number', { ex: 1 }),
        collectionfrom: P('string', 'Collection filter'),
        CollectionSymbol: P('string', 'Collection symbol filter'),
        Categoryname: P('string', 'Category filter (All = any)', { ex: 'All' }),
        Type: P('string', 'Type filter'),
        status: P('string', 'Sale status filter (All = any)', { ex: 'All' }),
        from: P('string', 'Source context'),
      },
      example: { MyItemAddr: '0x1a...', TabName: 'owned', page: 1, limit: 12 },
    },
    success: { code: 200, message: 'fetched', example: { status: true, message: 'fetched', data: [{ _id: '66a...', NFTName: 'Galaxy #1001' }] } },
    errors: ['400', '500'],
  }),

  ep('get', '/v1/nft/findOwners', {
    tag: 'NFT',
    summary: 'Get owners of an NFT',
    auth: 'none',
    params: [
      { name: 'NFTId', in: 'query', required: true, t: 'string', d: 'NFT id', ex: '66a...' },
    ],
    success: { code: 200, message: 'fetched', example: { status: true, message: 'fetched', data: [{ NFTOwner: '0x1a...', NFTBalance: 1 }] } },
    errors: ['400', '500'],
  }),

  ep('get', '/v1/nft/info', {
    tag: 'NFT',
    summary: 'Get NFT details',
    auth: 'none',
    params: [
      { name: 'NFTId', in: 'query', required: true, t: 'string', d: 'NFT id' },
      { name: 'ContractAddress', in: 'query', required: false, t: 'string', d: 'Collection contract address' },
    ],
    success: { code: 200, message: 'fetched', example: { status: true, message: 'fetched', data: { _id: '66a...', NFTName: 'Galaxy #1001', NFTPrice: 100 } } },
    errors: ['400', '404', '500'],
  }),

  ep('post', '/v1/nft/findupdatebalance', {
    tag: 'NFT',
    summary: 'Find or update NFT balance for a wallet',
    auth: 'none',
    encrypt: 'decrypt',
    body: {
      required: ['NFTId', 'NFTOwner'],
      props: {
        NFTId: P('string', 'NFT id'),
        NFTOwner: P('string', 'Owner wallet address'),
        NFTBalance: P('number', 'Balance to set', { ex: 1 }),
      },
      example: { NFTId: '66a...', NFTOwner: '0x1a...', NFTBalance: 1 },
    },
    success: { code: 200, message: 'fetched', encrypted: true, example: { status: true, message: 'fetched', data: { NFTBalance: 1 } } },
    errors: ['400', '500'],
  }),

  // ── Orders / buy / bids ───────────────────────────────────
  ep('post', '/v1/nft/CreateOrder', {
    tag: 'NFT',
    summary: 'Create / edit a bid order (marketplace)',
    auth: 'none',
    encrypt: 'decrypt',
    body: {
      required: ['TokenBidderAddress', 'NFTId', 'ContractAddress', 'ContractType', 'TokenBidAmt'],
      props: {
        TokenBidderAddress: P('string', 'Bidder wallet address'),
        TokenBidderAddress_Name: P('string', 'Bidder display name'),
        CollectionNetwork: P('string', 'Network', { ex: 'polygon' }),
        HashValue: P('string', 'Transaction hash'),
        TokenBidAmt: P('number', 'Bid amount', { ex: 150 }),
        ContractType: P('string', 'Contract type'),
        ContractAddress: P('string', 'Collection contract address'),
        NFTId: P('string', 'NFT id'),
        NFTQuantity: P('integer', 'Quantity', { ex: 1 }),
        from: P('string', 'create | Edit', { ex: 'create' }),
        NFTOwner: P('string', 'NFT owner wallet'),
        CoinName: P('string', 'Bid currency symbol', { ex: 'GALFI' }),
        click: P('string', 'Context flag'),
      },
      example: { TokenBidderAddress: '0x1a...', NFTId: '66a...', ContractAddress: '0x...', ContractType: 'planet', TokenBidAmt: 150, from: 'create' },
    },
    success: { code: 200, message: 'Success', encrypted: true, example: { status: true, message: 'Success', data: { _id: '66b...', TokenBidAmt: 150 } } },
    errors: ['400', '409', '500'],
  }),

  ep('post', '/v1/nft/BuyAccept', {
    tag: 'NFT',
    summary: 'Accept a buy / bid (buyer or seller confirm)',
    auth: 'user',
    encrypt: 'decrypt',
    body: {
      required: ['NFTId', 'ContractAddress', 'NFTOwner'],
      props: {
        NFTId: P('string', 'NFT id'),
        ContractAddress: P('string', 'Collection contract address'),
        ContractType: P('string', 'Contract type'),
        NFTPrice: P('number', 'Agreed price'),
        CoinName: P('string', 'Currency symbol'),
        ClockTime: P('integer', 'Start time (ms)'),
        EndClockTime: P('integer', 'End time (ms)'),
        HashValue: P('string', 'Transaction hash'),
        NFTOwner: P('string', 'Owner wallet'),
        activity: P('array', 'Activity entries'),
        NFTBalance: P('number', 'Balance'),
        ownBalance: P('number', 'Own balance'),
        from: P('string', 'Context'),
      },
      example: { NFTId: '66a...', ContractAddress: '0x...', NFTOwner: '0x2b...', HashValue: '0xabc...' },
    },
    success: { code: 200, message: 'Success', encrypted: true, example: { status: true, message: 'Success', data: { status: 'completed' } } },
    errors: ['400', '401', '409', '500'],
  }),

  ep('post', '/v1/nft/BidAction', {
    tag: 'NFT',
    summary: 'Place / edit a bid on an auction',
    auth: 'user',
    encrypt: 'decrypt',
    body: {
      required: ['NFTId', 'NFTOwner'],
      props: {
        NFTId: P('string', 'NFT id'),
        ContractAddress: P('string', 'Collection contract address'),
        ContractType: P('string', 'Contract type'),
        TokenBidderAddress: P('string', 'Bidder wallet'),
        TokenBidAmt: P('number', 'Bid amount'),
        NFTPrice: P('number', 'Current NFT price'),
        CoinName: P('string', 'Currency symbol', { ex: 'GALFI' }),
        ClockTime: P('integer', 'Start time (ms)'),
        EndClockTime: P('integer', 'End time (ms)'),
        HashValue: P('string', 'Transaction hash'),
        NFTOwner: P('string', 'Owner wallet'),
        activity: P('array', 'Activity entries'),
        NFTBalance: P('number', 'Balance'),
        ownBalance: P('number', 'Own balance'),
        from: P('string', 'create | Edit', { ex: 'create' }),
      },
      example: { NFTId: '66a...', NFTOwner: '0x2b...', TokenBidAmt: 200, from: 'create' },
    },
    success: { code: 200, message: 'Success', encrypted: true, example: { status: true, message: 'Success', data: { _id: '66b...', TokenBidAmt: 200 } } },
    errors: ['400', '401', '409', '500'],
  }),

  ep('get', '/v1/nft/activity', {
    tag: 'NFT',
    summary: 'Get activity history (bids, sales, listings)',
    auth: 'none',
    encrypt: 'decrypt',
    params: [
      { name: 'NFTId', in: 'query', required: false, t: 'string', d: 'Filter by NFT' },
      { name: 'page', in: 'query', required: false, t: 'integer', ex: 1 },
      { name: 'limit', in: 'query', required: false, t: 'integer', ex: 10 },
    ],
    success: { code: 200, message: 'fetched', encrypted: true, example: { status: true, message: 'fetched', data: [{ _id: '66c...', type: 'bid', NFTId: '66a...', amount: 150 }] } },
    errors: ['400', '500'],
  }),

  // ── Collections ───────────────────────────────────────────
  ep('post', '/v1/nft/CreateCollection', {
    tag: 'NFT',
    summary: 'Create a collection',
    desc: 'Accepts JSON body; also accepts `CollectionProfileImage` / `CollectionCoverImage` file uploads (multipart).',
    auth: 'none',
    body: {
      required: ['CollectionName', 'CollectionSymbol', 'CollectionType', 'CollectionNetwork', 'CollectionCreator'],
      props: {
        CollectionName: P('string', 'Collection name', { ex: 'Galaxy Planets' }),
        CollectionSymbol: P('string', 'Collection symbol', { ex: 'GALAXY' }),
        CollectionBio: P('string', 'Description'),
        CollectionType: P('string', 'planet | crew | ship | astroid | galficrew | galfispecialcrew', { ex: 'planet' }),
        CollectionNetwork: P('string', 'Network', { ex: 'polygon' }),
        CollectionCreator: P('string', 'Creator wallet address'),
        Category: P('string', 'Category'),
        CollectionContractAddress: P('string', 'Contract address'),
        softStakeReward: P('number', 'Soft-stake reward %'),
        CollectionProfileImage: P('file', 'Profile image file (multipart)'),
        CollectionCoverImage: P('file', 'Cover image file (multipart)'),
      },
      example: { CollectionName: 'Galaxy Planets', CollectionSymbol: 'GALAXY', CollectionType: 'planet', CollectionNetwork: 'polygon', CollectionCreator: '0x1a...' },
    },
    success: { code: 200, message: 'created', example: { status: true, message: 'created', data: { _id: '66d...', CollectionName: 'Galaxy Planets' } } },
    errors: ['400', '409', '500'],
  }),

  ep('post', '/v1/nft/CollectionByCreator', {
    tag: 'NFT',
    summary: 'Get collections created by a wallet',
    auth: 'none',
    body: {
      required: ['CollectionCreator'],
      props: {
        CollectionCreator: P('string', 'Creator wallet address'),
        page: P('integer', 'Page', { ex: 1 }),
        limit: P('integer', 'Per page', { ex: 12 }),
      },
      example: { CollectionCreator: '0x1a...', page: 1, limit: 12 },
    },
    success: { code: 200, message: 'fetched', example: { status: true, message: 'fetched', data: [{ _id: '66d...', CollectionName: 'Galaxy Planets' }] } },
    errors: ['400', '500'],
  }),

  ep('get', '/v1/nft/Collectionlist', {
    tag: 'NFT',
    summary: 'List all collections',
    auth: 'none',
    params: [
      { name: 'page', in: 'query', required: false, t: 'integer', ex: 1 },
      { name: 'limit', in: 'query', required: false, t: 'integer', ex: 12 },
      { name: 'type', in: 'query', required: false, t: 'string', d: 'Filter by collection type' },
    ],
    success: { code: 200, message: 'fetched', example: { status: true, message: 'fetched', data: [{ _id: '66d...', CollectionName: 'Galaxy Planets' }] } },
    errors: ['400', '500'],
  }),

  ep('get', '/v1/nft/CollectionBySymbol', {
    tag: 'NFT',
    summary: 'Get a collection by its symbol',
    auth: 'none',
    params: [
      { name: 'CollectionSymbol', in: 'query', required: true, t: 'string', d: 'Collection symbol', ex: 'GALAXY' },
    ],
    success: { code: 200, message: 'fetched', example: { status: true, message: 'fetched', data: { _id: '66d...', CollectionSymbol: 'GALAXY' } } },
    errors: ['400', '404', '500'],
  }),

  ep('put', '/v1/nft/Collectionstatus', {
    tag: 'NFT',
    summary: 'Change collection active status',
    auth: 'none',
    encrypt: 'decrypt',
    body: {
      required: ['id'],
      props: {
        id: P('string', 'Collection _id'),
        status: P('boolean', 'New active state'),
      },
      example: { id: '66d...', status: true },
    },
    success: { code: 200, message: 'status changed', encrypted: true, example: { status: true, message: 'status changed' } },
    errors: ['400', '500'],
  }),

  ep('post', '/v1/nft/editcollectionbycreator', {
    tag: 'NFT',
    summary: 'Edit a collection (creator)',
    auth: 'none',
    encrypt: 'decrypt',
    body: {
      required: ['_id'],
      props: {
        _id: P('string', 'Collection _id'),
        CollectionName: P('string', 'New name'),
        CollectionBio: P('string', 'New description'),
        CollectionProfileImage: P('string', 'Profile image key'),
        CollectionCoverImage: P('string', 'Cover image key'),
      },
      example: { _id: '66d...', CollectionName: 'Galaxy Planets V2' },
    },
    success: { code: 200, message: 'updated', encrypted: true, example: { status: true, message: 'updated' } },
    errors: ['400', '500'],
  }),

  ep('post', '/v1/nft/listcollectionnft', {
    tag: 'NFT',
    summary: 'List NFTs inside a collection',
    auth: 'none',
    body: {
      required: ['CollectionSymbol'],
      props: {
        CollectionSymbol: P('string', 'Collection symbol', { ex: 'GALAXY' }),
        page: P('integer', 'Page', { ex: 1 }),
        limit: P('integer', 'Per page', { ex: 12 }),
      },
      example: { CollectionSymbol: 'GALAXY', page: 1, limit: 12 },
    },
    success: { code: 200, message: 'fetched', example: { status: true, message: 'fetched', data: [{ _id: '66a...', NFTName: 'Galaxy #1001' }] } },
    errors: ['400', '500'],
  }),

  ep('post', '/v1/nft/nft_asset_info', {
    tag: 'NFT',
    summary: 'Get NFT asset info by token id',
    auth: 'none',
    body: {
      required: ['tokenId'],
      props: { tokenId: P('string', 'UUID token id', { fmt: 'uuid', ex: '6fa459ea-ee8a-3ca4-894e-db77e160355e' }) },
      example: { tokenId: '6fa459ea-ee8a-3ca4-894e-db77e160355e' },
    },
    success: { code: 200, message: 'fetched', example: { status: true, message: 'fetched', data: { _id: '66a...', NFTName: 'Galaxy #1001' } } },
    errors: ['400', '404', '500'],
  }),

  // ── Game NFTs (airdrop / mint from game) ──────────────────
  ep('post', '/v1/nft/createplanetnft', {
    tag: 'NFT',
    summary: 'Mint planet NFT from the game engine',
    auth: 'game-jwt',
    body: {
      required: ['transactionHash', 'network'],
      props: {
        transactionHash: P('string', 'Mint transaction hash'),
        network: P('string', 'Network'),
        otherDatas: P('object', 'Extra payload'),
        ipfs: P('object', 'IPFS metadata'),
        metaData: P('object', 'Metadata'),
        from: P('string', 'Context'),
        type: P('string', 'planet type'),
        names: P('array', 'Names'),
      },
      example: { transactionHash: '0xabc...', network: 'polygon' },
    },
    success: { code: 200, message: 'created', example: { status: true, message: 'created', data: { nftIds: ['1001'] } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/nft/createshipnft', {
    tag: 'NFT',
    summary: 'Mint ship NFT from the game engine',
    auth: 'game-jwt',
    body: {
      required: ['transactionHash', 'network'],
      props: {
        transactionHash: P('string', 'Mint transaction hash'),
        network: P('string', 'Network'),
        otherDatas: P('object', 'Extra payload'),
        ipfs: P('object', 'IPFS metadata'),
        metaData: P('object', 'Metadata'),
        from: P('string', 'Context'),
        type: P('string', 'ship type'),
        names: P('array', 'Names'),
      },
      example: { transactionHash: '0xabc...', network: 'polygon' },
    },
    success: { code: 200, message: 'created', example: { status: true, message: 'created', data: { nftIds: ['501'] } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/nft/createcrewnft', {
    tag: 'NFT',
    summary: 'Mint crew NFT from the game engine',
    auth: 'game-jwt',
    body: {
      required: ['transactionHash', 'network'],
      props: {
        transactionHash: P('string', 'Mint transaction hash'),
        network: P('string', 'Network'),
        otherDatas: P('object', 'Extra payload'),
        ipfs: P('object', 'IPFS metadata'),
        metaData: P('object', 'Metadata'),
        from: P('string', 'Context'),
        type: P('string', 'crew type'),
        names: P('array', 'Names'),
      },
      example: { transactionHash: '0xabc...', network: 'polygon' },
    },
    success: { code: 200, message: 'created', example: { status: true, message: 'created', data: { nftIds: ['8001'] } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/nft/gamestorenft', {
    tag: 'NFT',
    summary: 'Store game NFT ownership (game engine)',
    auth: 'game-jwt',
    body: {
      required: ['NFTId', 'NFTOwner'],
      props: {
        NFTId: P('string', 'NFT id'),
        NFTOwner: P('string', 'Owner wallet'),
        NFTBalance: P('number', 'Balance'),
      },
      example: { NFTId: '66a...', NFTOwner: '0x1a...' },
    },
    success: { code: 200, message: 'stored', example: { status: true, message: 'stored' } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/nft/ownednfts', {
    tag: 'NFT',
    summary: 'Get NFTs owned by the authenticated game user',
    auth: 'game-jwt',
    body: {
      required: [],
      props: {
        page: P('integer', 'Page', { ex: 1 }),
        limit: P('integer', 'Per page', { ex: 12 }),
        type: P('string', 'Filter by collection type'),
      },
      example: { page: 1, limit: 12 },
    },
    success: { code: 200, message: 'fetched', example: { status: true, message: 'fetched', data: [{ _id: '66a...', NFTName: 'Crew #8001' }] } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/nft/gamecollections', {
    tag: 'NFT',
    summary: 'Get collection list for the game (by type)',
    auth: 'none',
    body: {
      required: [],
      props: {
        limit: P('integer', 'Per page', { ex: 12 }),
        page: P('integer', 'Page', { ex: 1 }),
        Categoryname: P('string', 'all | crew | <category>', { ex: 'all' }),
        type: P('string', 'Collection type filter (all = all)', { ex: 'all' }),
      },
      example: { page: 1, limit: 12, type: 'all' },
    },
    success: { code: 200, message: 'fetched', example: { status: true, message: 'fetched', data: [{ _id: '66d...', CollectionName: 'Galaxy Crew' }] } },
    errors: ['400', '500'],
  }),

  ep('post', '/v1/nft/gamecrewnft', {
    tag: 'NFT',
    summary: 'Get crew NFTs for the game marketplace',
    auth: 'none',
    body: {
      required: [],
      props: {
        page: P('integer', 'Page', { ex: 1 }),
        limit: P('integer', 'Per page', { ex: 12 }),
        type: P('string', 'Crew type filter'),
      },
      example: { page: 1, limit: 12 },
    },
    success: { code: 200, message: 'fetched', example: { status: true, message: 'fetched', data: [{ _id: '66a...', NFTName: 'Crew #8001' }] } },
    errors: ['400', '500'],
  }),

  // ── Metadata sync ─────────────────────────────────────────
  ep('post', '/v1/nft/sync', {
    tag: 'NFT',
    summary: 'Create metadata for a user collection (sync from chain)',
    auth: 'none',
    body: {
      required: ['transactionHash', 'network'],
      props: {
        transactionHash: P('string', 'Mint transaction hash'),
        network: P('string', 'Network'),
        otherDatas: P('object', 'Extra data'),
        ipfs: P('object', 'IPFS metadata'),
        metaData: P('object', 'Metadata'),
        from: P('string', 'Context'),
        type: P('string', 'Asset type'),
        names: P('array', 'Names array'),
      },
      example: { transactionHash: '0xabc...', network: 'polygon', type: 'planet' },
    },
    success: { code: 200, message: 'synced', example: { status: true, message: 'synced', data: { synced: 5 } } },
    errors: ['400', '500'],
  }),

  ep('put', '/v1/nft/sync', {
    tag: 'NFT',
    summary: 'Update metadata for a user collection',
    auth: 'none',
    body: {
      required: ['transactionHash', 'network'],
      props: {
        transactionHash: P('string', 'Transaction hash'),
        network: P('string', 'Network'),
        otherDatas: P('object', 'Extra data'),
        ipfs: P('object', 'IPFS metadata'),
        metaData: P('object', 'Metadata'),
        from: P('string', 'Context'),
        type: P('string', 'Asset type'),
        names: P('array', 'Names array'),
      },
      example: { transactionHash: '0xabc...', network: 'polygon' },
    },
    success: { code: 200, message: 'updated', example: { status: true, message: 'updated', data: { updated: 3 } } },
    errors: ['400', '500'],
  }),

  // ── Contract signatures ───────────────────────────────────
  ep('post', '/v1/nft/contract/sign', {
    tag: 'NFT',
    summary: 'Generate a signed message for contract interaction',
    auth: 'none',
    encrypt: 'game-encrypt',
    body: {
      required: ['walletAddress', 'amount', 'message', 'nonce'],
      props: {
        walletAddress: P('string', 'Wallet address (must match ^0x[a-fA-F0-9]{40}$)', { ex: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b' }),
        amount: P('string', 'Amount as a numeric string', { ex: '100' }),
        message: P('string', 'Message to sign (max 200 chars)', { ex: 'Approve 100 GALFI' }),
        nonce: P('string', 'Numeric nonce string', { ex: '123456' }),
      },
      example: { walletAddress: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b', amount: '100', message: 'Approve 100 GALFI', nonce: '123456' },
    },
    success: { code: 200, message: 'signed', example: { status: true, message: 'signed', data: { signature: '0x...', hash: '0x...' } } },
    errors: ['400', '409', '500'],
  }),

  ep('post', '/v1/nft/contract/sign_v2', {
    tag: 'NFT',
    summary: 'Generate a signed message (v2 format)',
    auth: 'none',
    encrypt: 'game-encrypt',
    body: {
      required: ['walletAddress', 'amount', 'message', 'nonce'],
      props: {
        walletAddress: P('string', 'Wallet address (must match ^0x[a-fA-F0-9]{40}$)'),
        amount: P('string', 'Amount as a numeric string'),
        message: P('string', 'Message to sign (max 200 chars)'),
        nonce: P('string', 'Numeric nonce string'),
      },
      example: { walletAddress: '0x1a...', amount: '100', message: 'Approve 100 GALFI', nonce: '123456' },
    },
    success: { code: 200, message: 'signed', example: { status: true, message: 'signed', data: { signature: '0x...' } } },
    errors: ['400', '409', '500'],
  }),

  // ── Sync routes (mounted under /nft) ──────────────────────
  ep('post', '/v1/nft/sync/planets', {
    tag: 'NFT',
    summary: 'Sync planets with metadata (game engine)',
    auth: 'game',
    body: {
      required: [],
      props: { data: P('array', 'Planet sync payloads') },
      example: { data: [{ nftId: '1001', metaData: { name: 'Earth' } }] },
    },
    success: { code: 200, message: 'Planets synchronized successfully', example: { statusCode: 200, status: true, message: 'Planets synchronized successfully', data: { synced: 10 } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/nft/sync/asteroids', {
    tag: 'NFT',
    summary: 'Sync asteroids (game engine)',
    auth: 'game',
    body: {
      required: [],
      props: { data: P('array', 'Asteroid sync payloads') },
      example: { data: [{ nftId: '2001', metaData: { name: 'Ceres' } }] },
    },
    success: { code: 200, message: 'Asteroids synchronized successfully', example: { statusCode: 200, status: true, message: 'Asteroids synchronized successfully', data: { synced: 5 } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/nft/sync/ships', {
    tag: 'NFT',
    summary: 'Sync ships (game engine)',
    auth: 'game',
    body: {
      required: [],
      props: { data: P('array', 'Ship sync payloads') },
      example: { data: [{ nftId: '5001', metaData: { name: 'Voyager' } }] },
    },
    success: { code: 200, message: 'Ships synchronized successfully', example: { statusCode: 200, status: true, message: 'Ships synchronized successfully', data: { synced: 3 } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/nft/sync/crews', {
    tag: 'NFT',
    summary: 'Sync crews (game engine)',
    auth: 'game',
    body: {
      required: [],
      props: { data: P('array', 'Crew sync payloads') },
      example: { data: [{ nftId: '8001', metaData: { name: 'Pilot' } }] },
    },
    success: { code: 200, message: 'Crews synchronized successfully', example: { statusCode: 200, status: true, message: 'Crews synchronized successfully', data: { synced: 12 } } },
    errors: ['400', '401', '500'],
  }),
];

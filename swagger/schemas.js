/**
 * Reusable OpenAPI component schemas.
 *
 * These are derived from the ACTUAL Mongoose schemas in this project
 * (see the app modules under the "schema" folders). Only fields that really
 * exist on the models are documented here — no invented fields.
 *
 * NOTE: This is a Galfi NFT game-marketplace backend. There are no classic
 * "Product", "Cart" or "Order" entities. The closest real entities are
 * mapped as follows:
 *   - "Product"  -> NFT (token.schema.js)
 *   - "Order"    -> NFT buy/sell orders & bids (bid.schema.js, tokenowner.schema.js)
 *   - "Cart"     -> does not exist in this codebase (documented as absent)
 */

// MongoDB ObjectId reference (the project stores ids as strings)
const ObjectId = {
    type: 'string',
    description: 'MongoDB ObjectId',
    example: '667e91c21ea449904060390a',
};

// Decimal128 (mongoose.Types.Decimal128) is serialised as a string/number
const Decimal = {
    type: 'number',
    description: 'Decimal128 value',
};

const baseModel = (extra) => ({
    type: 'object',
    properties: {
        _id: ObjectId,
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        ...extra,
    },
});

export default {
    /* ------------------------------ USER ------------------------------ */
    User: baseModel({
        DisplayName: { type: 'string', example: 'galfi-user' },
        EmailId: { type: 'string', example: 'user@example.com' },
        Youtube: { type: 'string', nullable: true },
        Facebook: { type: 'string', nullable: true },
        Twitter: { type: 'string', nullable: true },
        Instagram: { type: 'string', nullable: true },
        level: { type: 'number', default: 1 },
        refferalCode: { type: 'string', nullable: true },
        refferalByCode: { type: 'string', nullable: true },
        refferedBy: { ...ObjectId, nullable: true },
        WalletAddress: { type: 'string', example: '0xabc...' },
        WalletType: { type: 'string', nullable: true },
        Profile: { type: 'string', nullable: true },
        profile_url: { type: 'string', nullable: true },
        Cover: { type: 'string', nullable: true },
        Bio: { type: 'string', nullable: true },
        CustomUrl: { type: 'string', nullable: true },
        freeNftClaimed: { type: 'boolean', default: false },
        isClaimed: { type: 'boolean', default: false },
        softClaimStart: { type: 'string', format: 'date-time', nullable: true },
        softClaimEnd: { type: 'string', format: 'date-time', nullable: true },
        Follower: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    Address: { type: 'string' },
                    CustomUrl: { type: 'string' },
                },
            },
        },
        Following: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    Address: { type: 'string' },
                    CustomUrl: { type: 'string' },
                },
            },
        },
        isTutorialPlayed: { type: 'boolean', default: false },
        isActive: { type: 'boolean', default: true },
        blockedStatus: {
            type: 'string',
            enum: ['active', 'suspended', 'blocked'],
            default: 'active',
        },
    }),

    /* ------------------------- NFT (token) ------------------------- */
    Token: baseModel({
        NFTId: { type: 'string' },
        NFTName: { type: 'string' },
        CollectionName: { type: 'string' },
        CollectionSymbol: { type: 'string' },
        Category: { type: 'string', description: 'e.g. galfiship, galficrew721, PlanetCollection721' },
        nftCategory: { type: 'string', nullable: true },
        nftType: { type: 'string', nullable: true },
        crewGender: { type: 'string', nullable: true },
        status: { type: 'boolean', default: true },
        NFTOrginalImage: { type: 'string' },
        image_url: { type: 'string' },
        fileType: { type: 'string' },
        image_thumb_url: { type: 'string' },
        image_animation_url: { type: 'string' },
        NFTThumpImage: { type: 'string' },
        NFTOrginalImageIpfs: { type: 'string' },
        NFTThumpImageIpfs: { type: 'string' },
        NFTProperties: { type: 'array', items: { type: 'object' } },
        NFTRoyalty: { type: 'string' },
        NFTCreator: { type: 'string' },
        NFTDescription: { type: 'string' },
        NFTQuantity: { type: 'string' },
        NFTOwnerDetails: { type: 'array', items: ObjectId },
        MetaData: { type: 'string' },
        MetaDataUrl: { type: 'string', nullable: true },
        CompressedFile: { type: 'string' },
        CompressedThumbFile: { type: 'string' },
        UnlockContent: { type: 'string' },
        ContractAddress: { type: 'string' },
        ContractType: { type: 'string', default: '721' },
        ContractName: { type: 'string' },
        CollectionNetwork: { type: 'string' },
        collectionAddress: { type: 'string' },
        HideShow: { type: 'string' },
        BuyType: { type: 'string' },
        reported: { type: 'boolean', default: false },
        isPromotion: { type: 'string', default: 'false' },
        islegalalert: { type: 'string', default: 'false' },
        deleted: { type: 'number', default: 1 },
        Owners: { type: 'array', items: { type: 'object' } },
        likecount: { type: 'number', default: 0 },
        ReportBy: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    Address: { type: 'string' },
                    CustomUrl: { type: 'string' },
                    Message: { type: 'string' },
                },
            },
        },
        RandomName: { type: 'string' },
        NonceHash: { type: 'string' },
        SignatureHash: { type: 'string' },
        next: { type: 'string', nullable: true },
        totalXP: { type: 'number', default: 0 },
        level: { type: 'number', default: 1 },
        missionAvailability: { type: 'boolean', default: true },
        missionType: {
            type: 'string',
            enum: ['', 'explore', 'mining', 'combat', 'social'],
            default: '',
        },
        isRecruite: { type: 'boolean', default: true },
        collectionTypeId: { ...ObjectId, nullable: true },
        collectionType: { type: 'string', nullable: true },
        crewType: { type: 'string', nullable: true },
        isLocked: { type: 'boolean', default: false },
        lastSync: { type: 'string', format: 'date-time' },
        hexId: { type: 'number', nullable: true },
    }),

    TokenOwner: baseModel({
        NFTId: { type: 'string' },
        NFTName: { type: 'string' },
        NFTOwner: { type: 'string' },
        NFTtype: { type: 'string' },
        BuyType: { type: 'string' },
        Category: { type: 'string' },
        CollectionName: { type: 'string' },
        ContractAddress: { type: 'string' },
        tokenowner: { type: 'string' },
        HashValue: { type: 'string' },
        PutOnSale: { type: 'string', default: 'false' },
        PutOnSaleType: { type: 'string', default: 'NotForSale' },
        NFTPrice: { type: 'string' },
        CoinName: { type: 'string' },
        Status: { type: 'string', default: 'list' },
        NFTQuantity: { type: 'string' },
        NFTBalance: { type: 'string' },
        ClockTime: { type: 'string', format: 'date-time', nullable: true },
        EndClockTime: { type: 'string', format: 'date-time', nullable: true },
        HideShow: { type: 'string', default: 'visible' },
        deleted: { type: 'number', default: 0 },
        burnToken: { type: 'number', default: 0 },
        Platform: { type: 'string', default: 'our' },
        bannerpromotion: { type: 'boolean', default: false },
        LazyStatus: { type: 'boolean', default: false },
        RandomName: { type: 'string' },
        NonceHash: { type: 'string' },
        SignatureHash: { type: 'string' },
        nftCategory: { type: 'string', nullable: true },
    }),

    Collection: baseModel({
        CollectionName: { type: 'string' },
        displayName: { type: 'string' },
        type: ObjectId,
        CollectionProfileImage: { type: 'string' },
        image_url: { type: 'string' },
        banner_url: { type: 'string' },
        opensea_url: { type: 'string' },
        total_supply: { type: 'string' },
        CollectionCoverImage: { type: 'string' },
        CollectionSymbol: { type: 'string' },
        CollectionBio: { type: 'string' },
        CollectionType: { type: 'string' },
        CollectionNetwork: { type: 'string' },
        CollectionCreator: { type: 'string' },
        Category: { type: 'string' },
        CollectionContractAddress: { type: 'string' },
        status: { type: 'boolean', default: true },
        fees: { type: 'array', items: { type: 'object' } },
        Approved: { type: 'boolean', default: true },
        isActive: { type: 'boolean', default: true },
    }),

    Bid: baseModel({
        TokenBidAmt: { type: 'number' },
        TokenBidderAddress: { type: 'string' },
        NFTId: { type: 'string' },
        status: { type: 'string', default: 'pending' },
        ContractAddress: { type: 'string' },
        ContractType: { type: 'string', default: '721' },
        HashValue: { type: 'string' },
        CoinName: { type: 'string' },
        deleted: { type: 'number', default: 1 },
        NFTQuantity: { type: 'number', default: 0 },
        Completed: { type: 'number', default: 0 },
        Pending: { type: 'number', default: 0 },
        Cancel: { type: 'number', default: 0 },
    }),

    /* --------------------------- EXCHANGE --------------------------- */
    Currency: baseModel({
        name: { type: 'string' },
        label: { type: 'string', description: 'unique token label e.g. GALFI, GFMNR' },
        value: { type: 'string' },
        notes: { type: 'string', nullable: true },
        decimal: { type: 'number' },
        address: { type: 'string', description: 'token contract address' },
        network: { type: 'string', nullable: true },
        valueofGalfi: Decimal,
        circulateCurrency: Decimal,
        isActive: { type: 'boolean', default: true },
        isWithdraw: { type: 'boolean', default: true },
        isDeposit: { type: 'boolean', default: true },
    }),

    TokenPool: baseModel({
        name: { type: 'string', nullable: true },
        lockedPeriod: { type: 'number', default: 1, description: 'in days' },
        rewardPercent: { type: 'number', default: 1, description: 'percent' },
        stakeCurrencyId: ObjectId,
        rewardCurrencyId: ObjectId,
        isActive: { type: 'boolean', default: true },
        imageUrl: { type: 'string', nullable: true },
    }),

    TokenStake: baseModel({
        userId: ObjectId,
        walletAddress: { type: 'string', nullable: true },
        poolId: ObjectId,
        rewardAmount: { type: 'number', default: 0 },
        stakedAmount: { type: 'number', default: 0 },
        stakeCurrencyId: ObjectId,
        rewardCurrencyId: ObjectId,
        lockedOn: { type: 'string', format: 'date-time', nullable: true },
        expire: { type: 'string', format: 'date-time', nullable: true },
        claimed: { type: 'boolean', default: false },
    }),

    Transaction: baseModel({
        from: { type: 'string' },
        to: { type: 'string' },
        action: { type: 'string', description: 'deposit / withdraw / swap' },
        hash: { type: 'string' },
        tokenName: { type: 'string' },
        tokens: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    label: { type: 'string' },
                    amount: { type: 'number' },
                },
            },
        },
        userassetId: { ...ObjectId, nullable: true },
        walletAddress: { type: 'string' },
        fromTokenName: { type: 'string' },
        toTokenName: { type: 'string' },
        fromToken: { type: 'string' },
        toToken: { type: 'string' },
    }),

    /* ---------------------------- CATEGORY ---------------------------- */
    Category: baseModel({
        name: { type: 'string' },
        isActive: { type: 'boolean', default: true },
    }),

    SubCategory: baseModel({
        Classid: ObjectId,
        category: { type: 'string' },
        key: { type: 'string' },
        value: { type: 'array', items: { type: 'object' } },
        isActive: { type: 'boolean', default: true },
    }),

    /* ------------------------------ ADMIN ------------------------------ */
    Admin: baseModel({
        email: { type: 'string' },
        password: { type: 'string', description: 'hashed password' },
        hashpassword: { type: 'string' },
        otp: { type: 'string', default: '' },
        otpExpire: { type: 'string', format: 'date-time', nullable: true },
    }),

    GameSetting: baseModel({
        rewardTimes: { type: 'number', default: 0 },
        adminPrivateKey: { type: 'string', default: '' },
        costTimes: { type: 'number', default: 0 },
        optionalCost: { type: 'number', default: 0 },
        consumabelTimes: { type: 'number', default: 0 },
        production_time_in_min: { type: 'number', default: 0 },
        contruction_time_in_min: { type: 'number', default: 0 },
        hex_jump_time_in_min: { type: 'number', default: 0 },
        refferal_Percent: { type: 'number', default: 0 },
        default_royalty: { type: 'number', default: 0 },
        missionReward: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    scope: { type: 'number' },
                    mission_min: { type: 'number' },
                    rewardTimes: { type: 'number' },
                    xpmin: { type: 'number' },
                    xpmax: { type: 'number' },
                },
            },
        },
        missionPlanetsLimit: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    rarity: { type: 'string' },
                    limit: { type: 'number' },
                },
            },
        },
        freeShipId: { ...ObjectId, nullable: true },
        missionRarityLevel: { type: 'array', items: { type: 'object' } },
        missionMultiplier: { type: 'array', items: { type: 'object' } },
        maxWithdrawLimit: { type: 'number', default: 0 },
        withdrawHitLimit: { type: 'number', default: 0 },
    }),

    /* --------------------------- PROFESSION --------------------------- */
    Profession: baseModel({
        key: { type: 'string', description: 'uppercase unique key' },
        image_male: { type: 'string' },
        image_female: { type: 'string' },
        nftCost: { type: 'number' },
        baseContribution: {
            type: 'object',
            properties: {
                mining: { type: 'number' },
                explore: { type: 'number' },
                social: { type: 'number' },
                combat: { type: 'number' },
            },
        },
        conditionalContribution: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    condition: { type: 'string' },
                    bonus: {
                        type: 'object',
                        properties: {
                            mining: { type: 'number' },
                            explore: { type: 'number' },
                            social: { type: 'number' },
                            combat: { type: 'number' },
                        },
                    },
                },
            },
        },
        rewardModifiers: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    type: { type: 'string' },
                    missionType: { type: 'string', nullable: true },
                    condition: { type: 'string', nullable: true },
                    value: { type: 'number' },
                },
            },
        },
        assignmentEffects: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    slot: { type: 'string' },
                    effect: { type: 'string', nullable: true },
                    value: { type: 'number', nullable: true },
                },
            },
        },
        isActive: { type: 'boolean', default: true },
    }),

    /* ------------------------------ CMS ------------------------------ */
    FAQ: baseModel({
        question: { type: 'string' },
        answer: { type: 'string' },
    }),

    CMS: baseModel({
        heading: { type: 'string' },
        description: { type: 'string' },
        slug: { type: 'string' },
        deleted: { type: 'boolean', default: false },
        image: { type: 'string' },
        twitter: { type: 'string', nullable: true },
        medium: { type: 'string', nullable: true },
        gitbook: { type: 'string', nullable: true },
        discord: { type: 'string', nullable: true },
        telegram: { type: 'string', nullable: true },
    }),

    CollectionType: baseModel({
        type: { type: 'string' },
        image: { type: 'string', nullable: true },
        image_url: { type: 'string', nullable: true },
        isActive: { type: 'boolean', default: true },
    }),

    Roadmap: baseModel({
        step: { type: 'number' },
        question: { type: 'string' },
        answer: { type: 'string' },
    }),

    /* --------------------------- PROMOTION --------------------------- */
    Blog: baseModel({
        heading: { type: 'string' },
        description: { type: 'string' },
        isActive: { type: 'boolean', default: true },
        image: { type: 'string' },
        url: { type: 'string' },
    }),

    News: baseModel({
        heading: { type: 'string' },
        description: { type: 'string' },
        isActive: { type: 'boolean', default: false },
        image: { type: 'string' },
        video: { type: 'string', nullable: true },
        url: { type: 'string' },
        navLink: { type: 'string' },
    }),

    Partner: baseModel({
        companyName: { type: 'string' },
        isActive: { type: 'boolean', default: true },
        image: { type: 'string', nullable: true },
        navLink: { type: 'string', nullable: true },
    }),

    Publish: baseModel({
        companyName: { type: 'string' },
        image: { type: 'string', nullable: true },
        navLink: { type: 'string', nullable: true },
        isActive: { type: 'boolean', default: true },
    }),

    /* ------------------------ RESPONSE ENVELOPES ------------------------ */
    // sendRes() format (plain JSON)
    ApiResponse: {
        type: 'object',
        properties: {
            statusCode: { type: 'number' },
            status: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', nullable: true },
        },
    },
    // sendResponse() format — note: body is AES-encrypted & base64 encoded
    EncryptedResponse: {
        type: 'string',
        description:
            'Response body is AES-encrypted then base64 encoded (see shared/credentialsetup.js Encryptdata). The decrypted payload is { status, message, data? }.',
    },
    // catchresponse() format
    ErrorResponse: {
        type: 'object',
        properties: {
            status: { type: 'boolean' },
            message: { type: 'string' },
        },
    },
};

import config from '../config/config.js'
const constant = Object.freeze({
    POOL_DB: 'pool',
    TOKEN_DB: 'token',
    USERPLANET_DB: 'userPlanet',
    MISSIONPLANET: 'missionPlanet',
    userasset: 'userasset',
    EXPLORED: 'explored', // not going to use
    EXPLORED_PLANET: 'exploredPlanet',
    USERSHIP_DB: 'userShip',
    CHAT_DB: 'chat',
    SHIP_DB: 'ship',
    battlestatus_DB: 'battlestatus',
    GAMESETTING_DB: 'gamesetting',
    PUBLISH_DB: 'publish',
    MISSIONSTATS: 'missionstats',
    PLANET_DB: 'planet',
    CURRENCY_DB: 'currency',
    USER_DB: 'user',
    LEVEL: 'level',
    TOKENPOOL_DB: 'tokenPool',
    TOKENSTAKE_DB: 'tokenStake',
    nearByPlanet_DB: 'nearByPlanet',
    ASSET_DB: 'asset',
    BLOG_DB: 'blog',
    PACK: 'pack',
    PRICE_DB: 'price',
    NEWS_DB: 'news',
    PARTNER_DB: 'partner',
    cmsbuilding_DB: 'cmsbuilding',
    Profession_DB: 'Profession',
    MissionReward_DB: 'missionReward',
    CATEGORY: 'category',
    CREW: 'crew',
    REWARD: 'reward',
    GALFICREW: 'galficrew',
    CATEGORYLIST: [
        'OGCREW',
        'GALFICREW',
        'GALFISPECIALCREW',
        'GALFISHIP',
        'GALFIPLANET',
        'GALFIASTEROID',
    ],
    TRAINING_PRICE: {
        lable: 'GALFI',
        amount: 10,
    },
    TRAINING_DETAILS: {
        time_minute: 10,
    },
    INPROGRESS: 'inprogress',
    TRAINING_REWARD_XP: 100,
    RARITY: ['common', 'uncommon', 'rare'],
    GENDER: ['male', 'female', 'other'],
    PLANET_TYPE: ['astroid', 'planet', 'asteroid'],
    MISSION_TYPE: ['combat', 'explore', 'mining', 'social'],
    MISSION_TYPE_FOR_BOOST: ['explore', 'combat', 'mining', 'social', 'all'],
    COMBAT: 'combat',
    EXPLORE: 'explore',
    MINE: 'mining',
    MINING: 'mining',
    SOCIAL: 'social',
    WITHDRAW: 'withdraw',
    TRAINING: 'training',
    STATUS: {
        INPROGRESS: 'inprogress',
        COMPLETED: 'completed',
        NOTSTARTED: 'notstarted',
    },
    DEPOSITE: 'deposite',
    SHIP_TYPE: ['combat', 'explore', 'mining', 'social'],
    GALFI_CREW_TYPE: ['pilot', 'explorer', 'miner', 'social'],
    BUILDSOLTBUILDTYPE: [
        'land',
        'mineral',
        'ore',
        'tetra',
        'lagrange',
        'orbital',
        'amrita',
        'asteroids',
    ],
    SOCIALSLUG: 'social',
    CREW: 'crew',
    ACTION: {
        SOFTSTAKEREWARD: 'softStakeReward',
    },
    BUY: 'buy',
    OWNED: 'owned',
    AIRDROP: 'airdrop',
    SLOTS: {
        planet: {
            common: [
                {
                    type: 'LAND',
                    slot: 10,
                },
                {
                    type: 'ORBIT',
                    slot: 1,
                },
                {
                    type: 'LAGRANGE',
                    slot: 1,
                },
                {
                    type: 'SUN',
                    slot: 1,
                },
                {
                    type: 'GFMNR',
                    slot: 1,
                },
                {
                    type: 'GFORE',
                    slot: 1,
                },
                {
                    type: 'AMRITA',
                    slot: 0,
                },
                {
                    type: 'TETRA',
                    slot: 0,
                },
                {
                    type: 'SPECIALIST',
                    slot: 3,
                },
            ],
            uncommon: [
                {
                    type: 'LAND',
                    slot: 15,
                },
                {
                    type: 'ORBIT',
                    slot: 2,
                },
                {
                    type: 'LAGRANGE',
                    slot: 2,
                },
                {
                    type: 'SUN',
                    slot: 1,
                },
                {
                    type: 'GFMNR',
                    slot: 1,
                },
                {
                    type: 'GFORE',
                    slot: 1,
                },
                {
                    type: 'AMRITA',
                    slot: 0,
                },
                {
                    type: 'TETRA',
                    slot: 1,
                },
            ],
            rare: [
                {
                    type: 'LAND',
                    slot: 20,
                },
                {
                    type: 'ORBIT',
                    slot: 3,
                },
                {
                    type: 'LAGRANGE',
                    slot: 3,
                },
                {
                    type: 'SUN',
                    slot: 2,
                },
                {
                    type: 'GFMNR',
                    slot: 2,
                },
                {
                    type: 'GFORE',
                    slot: 2,
                },
                {
                    type: 'AMRITA',
                    slot: 1,
                },
                {
                    type: 'TETRA',
                    slot: 1,
                },
            ],
        },
        asteroid: {
            common: [
                {
                    type: 'LAND',
                    slot: 2,
                },
                {
                    type: 'ORBIT',
                    slot: 1,
                },
                {
                    type: 'LAGRANGE',
                    slot: 1,
                },
                {
                    type: 'SUN',
                    slot: 0,
                },
                {
                    type: 'GFMNR',
                    slot: 0,
                },
                {
                    type: 'GFORE',
                    slot: 1,
                },
                {
                    type: 'AMRITA',
                    slot: 0,
                },
                {
                    type: 'TETRA',
                    slot: 0,
                },
                {
                    type: 'SPECIALIST',
                    slot: 3,
                },
            ],
            uncommon: [
                {
                    type: 'LAND',
                    slot: 4,
                },
                {
                    type: 'ORBIT',
                    slot: 1,
                },
                {
                    type: 'LAGRANGE',
                    slot: 1,
                },
                {
                    type: 'SUN',
                    slot: 0,
                },
                {
                    type: 'GFMNR',
                    slot: 0,
                },
                {
                    type: 'GFORE',
                    slot: 1,
                },
                {
                    type: 'AMRITA',
                    slot: 0,
                },
                {
                    type: 'TETRA',
                    slot: 0,
                },
                {
                    type: 'SPECIALIST',
                    slot: 3,
                },
            ],
            rare: [
                {
                    type: 'LAND',
                    slot: 6,
                },
                {
                    type: 'ORBIT',
                    slot: 1,
                },
                {
                    type: 'LAGRANGE',
                    slot: 1,
                },
                {
                    type: 'SUN',
                    slot: 1,
                },
                {
                    type: 'GFMNR',
                    slot: 1,
                },
                {
                    type: 'GFORE',
                    slot: 1,
                },
                {
                    type: 'AMRITA',
                    slot: 0,
                },
                {
                    type: 'TETRA',
                    slot: 0,
                },
                {
                    type: 'SPECIALIST',
                    slot: 3,
                },
            ],
        },
    },

    PROFESSIONS: [
        'normal', //for normal crews
        'crew',
        'pilot',
        'xenobiologist',
        'xenoanthropologist',
        'combat_specialist',
        'explorer',
        'mad_scientist',
        'mech_pilot',
        'capital_class_pilot',
        'governor',
        'foreman',
        'strategist',
        'engineer',
        'miner',
        'astroengineer',
        'megastructure_engineer',
        'visionary',
        'socialite',
        'poet',
        'artist',
        'xenoarcheologist',
        'xenohistorian',
        'xenobiologist',
        'entrepreneur',
        'investor',
        'psychiatrist',
        'ship_gunner',
        'ai_technician',
        'author',
        'farmer',
        'quantum_physicist',
        'sergeant_major',
        'ship_engineer',
    ],
    GALFISHIP: config.GALFISHIP,
    GALFIPLANET: config.GALFIPLANET,
    GALFISPECIALCREW: config.GALFISPECIALCREW,
    GALFICREW: config.GALFICREW,
    GALFIASTEROID: config.GALFIASTEROID,
    TRANSACTION_TYPE: {
        DEPOSIT: 'deposit',
        WITHDRAW: 'withdraw',
        SWAP: 'swap',
        BUY_SHIP: 'buy_ship',
        BUY_PLANET: 'buy_planet',
        BUY_CREW: 'buy_crew',
        REFFERAL_REWARD: 'refferal_reward',
        CLAIM_REWARD: 'claim_reward',
        MISSION_REWARD: 'mission_reward',
    },
    EXTRA_SLOTS: [
        {
            type: 'LAND',
            slot: 0,
        },
        {
            type: 'ORBIT',
            slot: 0,
        },
        {
            type: 'LAGRANGE',
            slot: 0,
        },
        {
            type: 'SUN',
            slot: 0,
        },
        {
            type: 'GFMNR',
            slot: 0,
        },
        {
            type: 'GFORE',
            slot: 0,
        },
        {
            type: 'AMRITA',
            slot: 0,
        },
        {
            type: 'TETRA',
            slot: 0,
        },
        {
            type: 'SPECIALIST',
            slot: 0,
        },
    ]
});
export default constant;

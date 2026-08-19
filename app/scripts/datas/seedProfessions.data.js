module.exports = [
    /* --------------------------------------------------*/
    // {
    //     key: 'CREW',
    //     nftCost: 0,
    //     baseContribution: { mining: 1, explore: 1, social: 1, combat: 1 },
    //     conditionalContribution: [],
    //     rewardModifiers: [],
    //     assignmentEffects: [],
    // },
    /* -------------------------------------------------- */
    {
        key: 'PILOT',
        nftCost: 10,
        // fallback when NOT in pilot slot
        baseContribution: { mining: 1, explore: 1, social: 1, combat: 1 },
        conditionalContribution: [
            {
                condition: 'PILOT_SLOT',
                bonus: { mining: 2, explore: 2, social: 2, combat: 2 },
            },
        ],
        rewardModifiers: [
            {
                type: 'PVP_PHASE2_COMBAT_ROLL',
                value: 1,
            },
        ],
        assignmentEffects: [],
    },

    /* -------------------------------------------------- */
    {
        key: 'XENOANTHROPOLOGIST',
        nftCost: 10,

        baseContribution: { mining: 1, explore: 5, social: 4, combat: 1 },

        conditionalContribution: [],
        rewardModifiers: [],
        assignmentEffects: [],
    },

    /* -------------------------------------------------- */
    {
        key: 'COMBAT_SPECIALIST',
        nftCost: 10,

        baseContribution: { mining: 1, explore: 1, social: 4, combat: 5 },

        conditionalContribution: [],

        rewardModifiers: [
            {
                type: 'MISSION_REWARD_PERCENT',
                missionType: 'COMBAT',
                value: 10,
                condition: 'ON_SHIP',
            },
        ],

        assignmentEffects: [],
    },

    /* -------------------------------------------------- */
    {
        key: 'EXPLORER',
        nftCost: 10,

        baseContribution: { mining: 2, explore: 5, social: 5, combat: 1 },

        conditionalContribution: [],
        rewardModifiers: [],
        assignmentEffects: [],
    },

    /* -------------------------------------------------- */
    {
        key: 'MAD_SCIENTIST',
        nftCost: 10,

        baseContribution: { mining: 2, explore: 3, social: 5, combat: 2 },

        conditionalContribution: [],
        rewardModifiers: [],
        assignmentEffects: [],
    },

    /* -------------------------------------------------- */
    {
        key: 'MECH_PILOT',
        nftCost: 10,

        // fallback when NOT piloting mech ship
        baseContribution: { mining: 1, explore: 1, social: 1, combat: 1 },

        conditionalContribution: [
            {
                condition: 'SHIP_CLASS_MECH',
                bonus: { mining: 3, explore: 3, social: 3, combat: 3 },
            },
        ],

        rewardModifiers: [],
        assignmentEffects: [],
    },

    /* -------------------------------------------------- */
    {
        key: 'CAPITAL_CLASS_PILOT',
        nftCost: 10,

        baseContribution: { mining: 1, explore: 1, social: 1, combat: 1 },

        conditionalContribution: [
            {
                condition: 'SHIP_CLASS_CAPITAL',
                bonus: { mining: 3, explore: 3, social: 3, combat: 3 },
            },
        ],

        rewardModifiers: [],
        assignmentEffects: [],
    },

    /* -------------------------------------------------- */
    {
        key: 'GOVERNOR',
        nftCost: 20,

        baseContribution: { mining: 1, explore: 1, social: 5, combat: 1 },

        conditionalContribution: [],
        rewardModifiers: [],

        assignmentEffects: [
            {
                slot: 'PLANET_OR_ASTEROID_SPECIALIST',
                effect: 'LAND_BUILD_SPEED_PERCENT',
                value: 10,
            },
        ],
    },

    /* -------------------------------------------------- */
    {
        key: 'FOREMAN',
        nftCost: 20,

        baseContribution: { mining: 5, explore: 2, social: 2, combat: 2 },

        conditionalContribution: [],
        rewardModifiers: [],

        assignmentEffects: [
            {
                slot: 'PLANET_OR_ASTEROID_SPECIALIST',
                effect: 'MINE_OUTPUT_PERCENT',
                value: 10,
            },
        ],
    },

    /* -------------------------------------------------- */
    {
        key: 'STRATEGIST',
        nftCost: 20,

        baseContribution: { mining: 4, explore: 2, social: 2, combat: 3 },

        conditionalContribution: [],

        rewardModifiers: [
            {
                type: 'MISSION_REWARD_PERCENT',
                value: 10,
                condition: 'ON_SHIP',
            },
        ],

        assignmentEffects: [
            {
                slot: 'PLANET_OR_ASTEROID_SPECIALIST',
            },
        ],
    },

    /* -------------------------------------------------- */
    {
        key: 'MINER',
        nftCost: 10,

        baseContribution: { mining: 5, explore: 3, social: 2, combat: 2 },

        conditionalContribution: [],
        rewardModifiers: [],
        assignmentEffects: [],
    },

    /* -------------------------------------------------- */
    {
        key: 'ASTROENGINEER',
        nftCost: 20,

        baseContribution: { mining: 2, explore: 3, social: 4, combat: 1 },

        conditionalContribution: [],
        rewardModifiers: [],

        assignmentEffects: [
            {
                slot: 'PLANET_OR_ASTEROID_SPECIALIST',
                effect: 'ORBITAL_BUILD_SPEED_PERCENT',
                value: 10,
            },
        ],
    },

    /* -------------------------------------------------- */
    {
        key: 'MEGASTRUCTURE_ENGINEER',
        nftCost: 20,

        baseContribution: { mining: 2, explore: 3, social: 5, combat: 1 },

        conditionalContribution: [],
        rewardModifiers: [],

        assignmentEffects: [
            {
                slot: 'PLANET_OR_ASTEROID_SPECIALIST',
                effect: 'MEGASTRUCTURE_BUILD_SPEED_PERCENT',
                value: 10,
            },
        ],
    },

    /* -------------------------------------------------- */
    {
        key: 'VISIONARY',
        nftCost: 10,

        baseContribution: { mining: 1, explore: 4, social: 6, combat: 1 },

        conditionalContribution: [],
        rewardModifiers: [],
        assignmentEffects: [],
    },

    /* -------------------------------------------------- */
    {
        key: 'SOCIALITE',
        nftCost: 10,

        baseContribution: { mining: 1, explore: 2, social: 6, combat: 1 },

        conditionalContribution: [],

        rewardModifiers: [
            {
                type: 'MISSION_REWARD_PERCENT',
                missionType: 'SOCIAL',
                value: 10,
                condition: 'ON_SHIP',
            },
        ],

        assignmentEffects: [],
    },

    /* -------------------------------------------------- */
    {
        key: 'POET',
        nftCost: 10,

        baseContribution: { mining: 1, explore: 4, social: 5, combat: 1 },

        conditionalContribution: [],
        rewardModifiers: [],
        assignmentEffects: [],
    },

    /* -------------------------------------------------- */
    {
        key: 'ARTIST',
        nftCost: 10,

        baseContribution: { mining: 1, explore: 4, social: 5, combat: 1 },

        conditionalContribution: [],
        rewardModifiers: [],
        assignmentEffects: [],
    },

    /* -------------------------------------------------- */
    {
        key: 'XENOARCHEOLOGIST',
        nftCost: 10,

        baseContribution: { mining: 1, explore: 7, social: 4, combat: 1 },

        conditionalContribution: [],
        rewardModifiers: [],
        assignmentEffects: [],
    },

    /* -------------------------------------------------- */
    {
        key: 'XENOHISTORIAN',
        nftCost: 10,

        baseContribution: { mining: 2, explore: 7, social: 5, combat: 1 },

        conditionalContribution: [],
        rewardModifiers: [],
        assignmentEffects: [],
    },

    /* -------------------------------------------------- */
    {
        key: 'XENOBIOLOGIST',
        nftCost: 10,

        baseContribution: { mining: 1, explore: 4, social: 4, combat: 5 },

        conditionalContribution: [],
        rewardModifiers: [],
        assignmentEffects: [],
    },

    /* -------------------------------------------------- */
    {
        key: 'ENTREPRENEUR',
        nftCost: 20,

        baseContribution: { mining: 1, explore: 3, social: 6, combat: 1 },

        conditionalContribution: [],
        rewardModifiers: [],

        assignmentEffects: [
            {
                slot: 'PLANET_OR_ASTEROID_SPECIALIST',
                effect: 'GALFI_OUTPUT_PERCENT',
                value: 10,
            },
        ],
    },

    /* -------------------------------------------------- */
    {
        key: 'INVESTOR',
        nftCost: 10,

        baseContribution: { mining: 3, explore: 2, social: 5, combat: 1 },

        conditionalContribution: [],
        rewardModifiers: [],
        assignmentEffects: [],
    },

    /* -------------------------------------------------- */
    {
        key: 'AI_TECHNICIAN',
        nftCost: 10,

        baseContribution: { mining: 2, explore: 3, social: 3, combat: 3 },

        conditionalContribution: [],
        rewardModifiers: [],
        assignmentEffects: [],
    },

    /* -------------------------------------------------- */
    {
        key: 'AUTHOR',
        nftCost: 10,

        baseContribution: { mining: 1, explore: 6, social: 3, combat: 1 },

        conditionalContribution: [],
        rewardModifiers: [],
        assignmentEffects: [],
    },

    /* -------------------------------------------------- */
    {
        key: 'FARMER',
        nftCost: 20,

        baseContribution: { mining: 2, explore: 1, social: 1, combat: 2 },

        conditionalContribution: [],
        rewardModifiers: [],

        assignmentEffects: [
            {
                slot: 'PLANET_OR_ASTEROID_SPECIALIST',
                effect: 'FARM_OUTPUT_PERCENT',
                value: 10,
            },
        ],
    },

    /* -------------------------------------------------- */
    {
        key: 'QUANTUM_PHYSICIST',
        nftCost: 10,

        baseContribution: { mining: 2, explore: 2, social: 3, combat: 3 },

        conditionalContribution: [],
        rewardModifiers: [],
        assignmentEffects: [],
    },

    /* -------------------------------------------------- */
    {
        key: 'SERGEANT_MAJOR',
        nftCost: 10,

        baseContribution: { mining: 2, explore: 2, social: 2, combat: 5 },

        conditionalContribution: [],
        rewardModifiers: [],
        assignmentEffects: [],
    },

    /* -------------------------------------------------- */
    {
        key: 'SHIP_ENGINEER',
        nftCost: 20,

        baseContribution: { mining: 2, explore: 3, social: 5, combat: 1 },

        conditionalContribution: [],
        rewardModifiers: [],

        assignmentEffects: [
            {
                slot: 'PLANET_OR_ASTEROID_SPECIALIST',
                effect: 'SHIP_BUILD_COST_REDUCTION_PERCENT',
                value: 10,
            },
        ],
    },
];

const mongoose = require('mongoose');

/* -------------------------------------------------- */
/* Contribution Sub Schema */
/* -------------------------------------------------- */

const ContributionSchema = new mongoose.Schema(
    {
        mining: { type: Number, default: 0 },
        explore: { type: Number, default: 0 },
        social: { type: Number, default: 0 },
        combat: { type: Number, default: 0 },
    },
    { _id: false },
);

/* -------------------------------------------------- */
/* Conditional Contribution */
/* Example:
 * {
 *   condition: 'PILOT_SLOT',
 *   bonus: { mining:2, explore:2, social:2, combat:2 }
 * }
 */
/* -------------------------------------------------- */

const ConditionalContributionSchema = new mongoose.Schema(
    {
        condition: {
            type: String,
            required: true,
            trim: true,
        },
        bonus: {
            type: ContributionSchema,
            required: true,
        },
    },
    { _id: false },
);

/* -------------------------------------------------- */
/* Reward Modifier (Flexible Game Rule Engine)
 * Example:
 * {
 *   type: 'MISSION_REWARD_PERCENT',
 *   missionType: 'COMBAT',
 *   value: 10,
 *   condition: 'ON_SHIP'
 * }
 */
/* -------------------------------------------------- */

const RewardModifierSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
        },

        missionType: {
            type: String,
            default: null,
        },

        condition: {
            type: String,
            default: null,
        },

        value: {
            type: Number,
            required: true,
        },
    },
    { _id: false },
);

/* -------------------------------------------------- */
/* Assignment Effects
 * Planet / Asteroid specialist bonuses
 */
/* -------------------------------------------------- */

const AssignmentEffectSchema = new mongoose.Schema(
    {
        slot: {
            type: String,
            required: true,
        },

        effect: {
            type: String,
            default: null,
        },

        value: {
            type: Number,
            default: null,
        },
    },
    { _id: false },
);

/* -------------------------------------------------- */
/* Main Profession Schema */
/* -------------------------------------------------- */

const ProfessionSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        image_male: {
            type: String,
            default: ""
        },
        image_female: {
            type: String,
            default: ""
        },
        nftCost: {
            type: Number,
            required: true, //if ask have to update price
            default: 0,
        },

        baseContribution: {
            type: ContributionSchema,
            required: true,
        },

        conditionalContribution: {
            type: [ConditionalContributionSchema],
            default: [],
        },

        rewardModifiers: {
            type: [RewardModifierSchema],
            default: [],
        },

        assignmentEffects: {
            type: [AssignmentEffectSchema],
            default: [],
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('Profession', ProfessionSchema);

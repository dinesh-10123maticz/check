const yup = require('yup');

const rewardModifierSchema = yup.object({
    appliesTo: yup
        .string()
        .oneOf(['mission', 'combat', 'building', 'resource', 'ship', 'global'])
        .required(),

    target: yup.string().default('all'),

    condition: yup.string().required(),

    valueType: yup.string().oneOf(['PERCENT', 'FLAT']).required(),

    value: yup.number().required(),

    description: yup.string(),
});

const createProfessionSchema = yup.object({
    symbol: yup.string().trim().uppercase().required(),
    profession: yup.string().trim().required(),

    baseContribution: yup.object({
        exploration: yup.number().min(0).default(0),
        science: yup.number().min(0).default(0),
        social: yup.number().min(0).default(0),
        combat: yup.number().min(0).default(0),
    }),

    baseCost: yup.number().min(0).required(),

    rewardModifiers: yup.array().of(rewardModifierSchema),

    notes: yup.string(),
    isActive: yup.boolean(),
});

const updateProfessionSchema = createProfessionSchema.partial();

module.exports = {
    createProfessionSchema,
    updateProfessionSchema,
};

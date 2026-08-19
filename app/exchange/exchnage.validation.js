import { ValidationResponse } from '../../shared/commonFunction';
const yup = require('yup');

export const createTokenPoolVal = yup.object().shape({
    imageUrl: yup.string().optional(true),
    name: yup.string().trim().required(),
    lockedPeriod: yup.number().positive().required(),
    rewardPercent: yup.number().positive().required(),
    stakeCurrencyId: yup.string().trim().required(),
    rewardCurrencyId: yup.string().trim().required(),
});

export const UpdateTokenPoolVal = yup.object().shape({
    _id: yup.string().required(),
    // imageUrl: yup.string().required(),
    // rewardPercent : yup.number().positive().required(),
    // lockedPeriod: yup.number().positive().required(),
    // stakeCurrencyId: yup.string().trim().required(),
    // rewardCurrencyId: yup.string().trim().required(),
});

export const stackToken = yup.object().shape({
    poolId: yup.string().required(),
    amount: yup.number().positive().required(),
});

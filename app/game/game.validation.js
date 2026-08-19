import { FinduserById, findinuserCurrency } from '../user/user.services';
import jwt from 'jsonwebtoken';
import config from './../../config/config';
import constant from '../../shared/constant';
import { Decimal128 } from 'mongodb';
import { sendRes, ValidationResponse } from '../../shared/commonFunction';
import logger from '../../utils/logger';
const yup = require('yup');

export const validatecreateUserAsset = async (req, res, next) => {
    try {
        const validationSchema = yup.object().shape({
            build_Number: yup.number().required('Build number is required'),

            walletAddress: yup.string().required('Wallet address is required'),

            userPlanetId: yup.string().required('Planet ID is required'),

            assetId: yup.string().required('Asset ID is required'),

            asset_name: yup.string().required('Asset name is required'),

            x: yup.number().required('X coordinate is required'),

            y: yup.number().required('Y coordinate is required'),
        });

        // Validate the request body against the schema
        await validationSchema.validate(req.body);
        next(); // Proceed to the next middleware or route handler if validation succeeds
    } catch (err) {
        // Respond with a 400 error and validation message if validation fails
        return ValidationResponse(res, 400, false, 'validation error', err.errors.join(', '));
    }
};

// validation for have balance

// export const checkforenounghbalance = async (consuption, walletAddress) => {
//     try {
//         if (consuption.length == 0) {
//             return true;
//         }

//         const userbalance = await findinuserCurrency({ walletAddress: walletAddress });

//         for (let i = 0; i < consuption.length; i++) {
//             const consumptionItem = consuption[i];

//             for (let j = 0; j < userbalance.length; j++) {
//                 let balanceItem = userbalance[j];
//                 if (
//                     consumptionItem.label === balanceItem.label ||
//                     consumptionItem.label.toLowerCase() === balanceItem.name.toLowerCase()
//                 ) {
//                     logger.info(
//                         'balanceItem',
//                         balanceItem,
//                         userbalance[j],
//                         Number(consumptionItem.amount),
//                         Number(balanceItem.balance),
//                     );

//                     if (Number(consumptionItem.amount) > Number(balanceItem.balance)) {
//                         return false;
//                     }
//                 }
//             }
//         }

//         return true;
//     } catch (err) {
//         return false;
//     }
// };

export const checkforenounghbalance = async (consumption, walletAddress) => {
    try {

        consumption = Array.isArray(consumption) ? consumption : consumption ? [consumption] : [];


        if (consumption.length === 0) {
            return { status: true };
        }

        const userbalance = await findinuserCurrency({ walletAddress });

        const shortages = [];

        for (const consumptionItem of consumption) {
            const balanceItem = userbalance.find(
                (item) =>
                    item.label === consumptionItem.label ||
                    item.name?.toLowerCase() === consumptionItem.label?.toLowerCase()
            );

            const available = balanceItem ? Number(balanceItem.balance) : 0;
            const required = Number(consumptionItem.amount);

            if (required > available) {
                shortages.push({
                    label: consumptionItem.label,
                    shortage: required - available,
                });
            }
        }

        if (shortages.length > 0) {
            const message = shortages
                .map(item => `${item.shortage} more ${item.label}`)
                .join(" and ");

            return {
                status: false,
                message: `You need ${message} to start production.`,
                shortages,
            };
        }

        return { status: true };
    } catch (err) {
        console.log("Error checking balance:", err)
        return {
            status: false,
            message: "Unable to verify balance.",
        };
    }
};

export const claimrewardvalidatation = async (req, res, next) => {
    try {
        const validationSchema = yup.object().shape({
            build_Number: yup.string().trim().required('Build number is required'),
        });
        await validationSchema.validate(req.body);
        next();
    } catch (err) {
        return ValidationResponse(res, 400, false, 'validation error', err.errors.join(', '));
    }
};

export const initipfs_validation = async (req, res, next) => {
    try {
        const validationSchema = yup.object().shape({
            planetId: yup.string().trim().required('Planet ID is required'),
            WalletAddress: yup.string().trim().required('Wallet address is required'),
        });
        await validationSchema.validate(req.body);
        next();
    } catch (err) {
        return ValidationResponse(res, 400, false, 'validation error', err.errors.join(', '));
    }
};

const initIpfsSchemaV2 = yup
    .object({
        planetId: yup.string().trim().required('Planet ID is required'),

        WalletAddress: yup
            .string()
            .trim()
            .lowercase()
            .required('Wallet address is required')
            .matches(/^0x[a-f0-9]{40}$/, 'Invalid wallet address'),

        priceType: yup
            .string()
            .trim()
            .lowercase()
            .oneOf(['coin', 'token'], 'Price type must be coin or token')
            .required('Price type is required'),

        symbol: yup.string().when('priceType', {
            is: 'token',
            then: yup
                .string()
                .trim()
                .uppercase()
                .default('POL')
                .matches(/^[A-Z0-9]{2,10}$/, 'Invalid token symbol'),
            otherwise: yup.string().strip(),
        }),
    })
    .noUnknown(true, 'Unknown fields are not allowed')
    .strict(true);

// export const initipfs_validationV2 = async (req, res, next) => {
//     try {
//         const validatedBody = await initIpfsSchemaV2.validate(req.body, {
//             abortEarly: false, // return all validation errors
//             stripUnknown: true, // remove unwanted fields
//         });

//         req.body = validatedBody; // sanitized input
//         next();
//     } catch (err) {
//         const message = Array.isArray(err.errors)
//             ? err.errors.join(', ')
//             : err.message || 'Invalid request payload';

//         return ValidationResponse(res, 400, false, 'validation error', message);
//     }
// };

export const initipfs_validationV2 = (req, res, next) => {
    const errors = [];
    const body = req.body || {};

    console.log("initipfs_validationV2", req.body)
    // planetId
    // if (!body.planetId || typeof body.planetId !== 'string') {
    //     errors.push('Planet ID is required');
    // }

    if (!body.rarity || typeof body.rarity !== 'string') {
        errors.push('Rarity is required');
    }

    // WalletAddress
    if (!body.WalletAddress || typeof body.WalletAddress !== 'string') {
        errors.push('Wallet address is required');
    } else if (!/^0x[a-f0-9]{40}$/i.test(body.WalletAddress.trim())) {
        errors.push('Invalid wallet address');
    }

    // priceType
    if (!body.priceType || typeof body.priceType !== 'string') {
        errors.push('Price type is required');
    } else if (!['coin', 'token'].includes(body.priceType.toLowerCase())) {
        errors.push('Price type must be coin or token');
    }

    // symbol (only when priceType === "token")
    if (body.priceType?.toLowerCase() === 'token') {
        // if (body.symbol) {
        //   if (!/^[A-Z0-9]{2,10}$/.test(body.symbol.toUpperCase())) {
        //     errors.push("Invalid token symbol");
        //   }
        // } else {
        // }
    } else {
        body.symbol = 'POL'; // default
        // delete body.symbol; // strip when coin
    }

    // noUnknown fields
    const allowedFields = ['rarity', 'WalletAddress', 'priceType', 'symbol'];
    const unknownFields = Object.keys(body).filter((key) => !allowedFields.includes(key));

    if (unknownFields.length > 0) {
        errors.push('Unknown fields are not allowed');
    }

    if (errors.length > 0) {
        return ValidationResponse(res, 400, false, 'validation error', errors.join(', '));
    }

    // normalize data
    req.body = {
        rarity: body.rarity.trim(),
        WalletAddress: body.WalletAddress.trim().toLowerCase(),
        priceType: body.priceType.toLowerCase(),
        ...(body.symbol ? { symbol: body.symbol.toUpperCase() } : {}),
    };

    next();
};


export const userAsset_validation = async (req, res, next) => {
    try {
        const validationSchema = yup.object().shape({
            userPlanetId: yup.string().trim().required('userPlanet ID is required'),
        });
        await validationSchema.validate(req.query);
        next();
    } catch (err) {
        return ValidationResponse(res, 400, false, 'validation error', err.errors.join(', '));
    }
};
export const autoaddlevel_val = async (req, res, next) => {
    const { assetId, imageKey } = req.body;

    if (!assetId) {
        return sendRes(res, 400, false, 'need assetId', {});
    }
    if (!imageKey) {
        return sendRes(res, 400, false, 'image need for this level');
    }
    next();
};
export const createCrew_val = async (req, res, next) => {
    try {
        const { name, crewType, rarity, imageKey, price, gender, collectionId, NFTProperties } =
            req.body;

        const schema = yup.object().shape({
            name: yup.string().required(),
            crewType: yup.string().required(),
            rarity: yup.string().oneOf(constant.RARITY).required(),
            imageKey: yup.string().required(),
            price: yup.array().of(
                yup.object().shape({
                    label: yup.string(),
                    amount: yup.number(),
                }),
            ),
            gender: yup.string().oneOf(constant.GENDER).required(),
            collectionId: yup.string().required(),
            NFTProperties: yup.array().of(
                yup.object().shape({
                    // Define specific properties of each NFTProperty object if known
                    trait_type: yup.string(),
                    value: yup.string(),
                }),
            ),
        });
        await schema.validate(req.body);
        next();
    } catch (err) {
        return ValidationResponse(res, 400, false, 'validation error', err.errors.join(', '));
    }
};

export const addlevel_val = async () => {
    try {
        const schema = yup.object().shape({
            assetId: yup.string().trim().required(),
            level: yup.number().integer().min(1).required(),
            description: yup.string().trim().required(),
            specialConditions: yup.string().trim(),
            Blocks: yup.number().integer(),
            reward: yup
                .array()
                .of(
                    yup.object().shape({
                        label: yup.string().trim(),
                        amount: yup.number().positive(),
                    }),
                )
                .required(),
            cost: yup
                .array()
                .of(
                    yup.object().shape({
                        label: yup.string().trim(),
                        amount: yup.number().positive(),
                    }),
                )
                .required(),
            dailyConsumption: yup
                .array()
                .of(
                    yup.object().shape({
                        label: yup.string().trim(),
                        amount: yup.number().positive(),
                    }),
                )
                .required(),
            optionalCost: yup.array().of(
                yup.object().shape({
                    label: yup.string().trim(),
                    amount: yup.number().positive(),
                }),
            ),
            HullPoints: yup.number().integer().min(0).required(),
            AttackPoints: yup.number().integer().min(0).required(),
            build_time_min: yup.number().integer().min(0).required(),
            imageKey: yup.string().trim().required(),
        });
        await schema.validate(req.body);
    } catch (err) {
        return ValidationResponse(res, 400, false, 'validation error', err.errors.join(', '));
    }
};

export const startmission_val = async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            shipId: yup.string().required(),
            scope: yup.number().required(),
            missiontype: yup.string().oneOf(constant.MISSION_TYPE).required(),
        });
        await schema.validate(req.body);
        next();
    } catch (err) {
        return ValidationResponse(res, 400, false, 'validation error', err.errors.join(', '));
    }
};


export const specialcrew_validation = (req, res, next) => {
    const errors = [];
    const body = req.body || {};

    console.log("initipfs_validationV2", req.body)

    if (!body.gender || typeof body.gender !== 'string') {
        errors.push('Gender is required');
    }
    if (!body.key || typeof body.key !== 'string') {
        errors.push('Key is required');
    }

    // WalletAddress
    if (!body.WalletAddress || typeof body.WalletAddress !== 'string') {
        errors.push('Wallet address is required');
    } else if (!/^0x[a-f0-9]{40}$/i.test(body.WalletAddress.trim())) {
        errors.push('Invalid wallet address');
    }

    // priceType
    if (!body.priceType || typeof body.priceType !== 'string') {
        errors.push('Price type is required');
    } else if (!['coin', 'token'].includes(body.priceType.toLowerCase())) {
        errors.push('Price type must be coin or token');
    }

    // symbol (only when priceType === "token")
    if (body.priceType?.toLowerCase() === 'token') {
        // if (body.symbol) {
        //   if (!/^[A-Z0-9]{2,10}$/.test(body.symbol.toUpperCase())) {
        //     errors.push("Invalid token symbol");
        //   }
        // } else {
        // }
    } else {
        body.symbol = 'POL'; // default
        // delete body.symbol; // strip when coin
    }

    // noUnknown fields
    const allowedFields = ['gender', 'key', 'WalletAddress', 'priceType', 'symbol'];
    const unknownFields = Object.keys(body).filter((key) => !allowedFields.includes(key));

    if (unknownFields.length > 0) {
        errors.push('Unknown fields are not allowed');
    }

    if (errors.length > 0) {
        return ValidationResponse(res, 400, false, 'validation error', errors.join(', '));
    }

    // normalize data
    req.body = {
        gender: body.gender.trim(),
        key: body.key.trim(),
        WalletAddress: body.WalletAddress.trim().toLowerCase(),
        priceType: body.priceType.toLowerCase(),
        ...(body.symbol ? { symbol: body.symbol.toUpperCase() } : {}),
    };

    next();
};
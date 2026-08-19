import { sendRes, ValidationResponse } from '../../shared/commonFunction';
import constant from '../../shared/constant';
const yup = require('yup');

export const startMissionVal = async (req, res, next) => {
    try {
        // nearByPlanetId, userShipId, crew, scope, missiontype
        const schema = yup.object().shape({
            nearByPlanetId: yup.string().required('nearByPlanetId is required').trim(),
            userShipId: yup.string().required('User Ship ID is required').trim(),
            crew: yup.array().required('At least one crew member is required'),
            scope: yup.number().required('Scope is required'),
            missiontype: yup
                .string()
                .oneOf(constant.MISSION_TYPE, 'Invalid mission type')
                .required('Mission type is required'),
        });

        await schema.validate(req.body);
        next();
    } catch (err) {
        return ValidationResponse(res, 400, false, 'validation error', err.errors);
    }
};

export const AddExplorePlanet_Script_validation = async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            prefixNameforPlanet: yup.string().required('prefixNameforPlanet is required').trim(),
            baseImageurl: yup.string().required('baseImageurl is required').trim(),
            start: yup.number().required('limit is required'),

            end: yup.number().required('limit is required'),
        });

        await schema.validate(req.body);
        next();
    } catch (err) {
        return ValidationResponse(res, 400, false, 'validation error', err.errors);
    }
};

export const getExplorePlanet_validation = async (req, res, next) => {
    try {
        req.query.page = Number(req.query.page ?? 1);
        req.query.limit = Number(req.query.limit ?? 12);

        // const schema = yup.object().shape({
        //   page: yup.number().required('limit is required'),
        //   limit: yup.number().required('scope is required')
        // });

        // await schema.validate(req.query);
        next();
    } catch (err) {
        return ValidationResponse(res, 400, false, 'validation error', err.errors);
    }
};

export const getExplorePlanet_validationV2 = async (req, res, next) => {
    try {
        let error = {
            planetRarity: '',
            fromNftId: '',
        };
        const {
            query: { planetRarity, fromNftId },
        } = req;
        if (!planetRarity) error.planetRarity = 'planetRarity is required';
        if (!fromNftId) error.fromNftId = 'fromNftId is required';
        if (Object.keys(error).length)
            return ValidationResponse(res, 400, false, 'validation error', error);
        next();
    } catch (err) {
        return ValidationResponse(res, 400, false, 'validation error', err.errors);
    }
};

export const updateMissionBonusReward = async (req, res, next) => {
    try {
        const error = {};

        const {
            miningBonusReward,
            exploreBonusReward,
            socialBonusReward,
            combatBonusReward,
        } = req.body;

        if (miningBonusReward === "")
            error.miningBonusReward = "Mining Bonus Reward should not be empty";

        if (exploreBonusReward === "")
            error.exploreBonusReward = "Explore Bonus Reward should not be empty";

        if (socialBonusReward === "")
            error.socialBonusReward = "Social Bonus Reward should not be empty";

        if (combatBonusReward === "")
            error.combatBonusReward = "Combat Bonus Reward should not be empty";

        if (Object.keys(error).length)
            return ValidationResponse(res, 400, false, "Validation error", error);

        const schema = yup.object().shape({
            miningBonusReward: yup.number().required(),
            exploreBonusReward: yup.number().required(),
            socialBonusReward: yup.number().required(),
            combatBonusReward: yup.number().required(),
        });

        await schema.validate(req.body);
        next();
    } catch (err) {
        return ValidationResponse(res, 400, false, "validation error", err.errors);
    }
};
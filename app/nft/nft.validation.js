import { sendRes, ValidationResponse } from '../../shared/commonFunction';
const yup = require('yup');

export const nftAssetInfo = async (req, res, next) => {
    try {
        const validationSchema = yup.object().shape({
            tokenId: yup.uuid().required('tokenId required'),
        });

        // Validate the request body against the schema
        await validationSchema.validate(req.body);
        next(); // Proceed to the next middleware or route handler if validation succeeds
    } catch (err) {
        // Respond with a 400 error and validation message if validation fails
        return ValidationResponse(res, 409, false, 'validation error', err.errors.join(', '));
    }
};

export const fetchAndSaveCollection = async (req, res, next) => {
    try {
        const validationSchema = yup.object().shape({
            collectionaddress: yup.string().required('collectionaddress required'),
            type: yup.string().required('collectionaddress required'),
            displayName: yup.string().required('collectionaddress required'),
            network: yup.string().required('collectionaddress required'),
        });

        // Validate the request body against the schema
        await validationSchema.validate(req.body);
        next(); // Proceed to the next middleware or route handler if validation succeeds
    } catch (err) {
        // Respond with a 400 error and validation message if validation fails
        return ValidationResponse(res, 409, false, 'validation error', err.errors.join(', '));
    }
};

export const signValidation = async (req, res, next) => {
    try {
        const validationSchema = yup.object({
            walletAddress: yup
                .string()
                .required('walletAddress is required')
                .matches(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),

            amount: yup
                .string()
                .required('amount is required')
                .matches(/^[0-9]+$/, 'amount must be a number string'),

            message: yup.string().required('message is required').max(200, 'message too long'),

            nonce: yup
                .string()
                .required('nonce is required')
                .matches(/^[0-9]+$/, 'nonce must be numeric'),
        });

        await validationSchema.validate(req.body);
        next(); // Proceed to the next middleware or route handler if validation succeeds
    } catch (e) {
        return ValidationResponse(res, 409, false, 'validation error', e.errors.join(', '));
    }
};

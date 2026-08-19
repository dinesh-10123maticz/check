import { ValidationResponse } from '../../shared/commonFunction';
const yup = require('yup');


export const updateShipPrice_validation = async (req, res, next) => {
    try {
        const validationSchema = yup.object().shape({
            shipId: yup.string().trim().required('Ship ID is required'),
        });
        await validationSchema.validate(req.body);
        next();
    } catch (err) {
        return ValidationResponse(res, 400, false, 'validation error', err.errors.join(', '));
    }
};

export const galfiShipPrice_validation = async (req, res, next) => {
    try {
        const validationSchema = yup.object().shape({
            shipId: yup.string().trim().required('Ship ID is required'),
        });
        await validationSchema.validate(req.body);
        next();
    } catch (err) {
        return ValidationResponse(res, 400, false, 'validation error', err.errors.join(', '));
    }
};

export const galfiBuildingPrice_validation = async (req, res, next) => {
    try {
        console.log("req.body", req.body)
        const validationSchema = yup.object().shape({
            assetId: yup.string().trim().required("Asset ID is required"),
            level: yup
                .number()
                .typeError("Level must be a number")
                .required("Level is required"),
        });

        await validationSchema.validate(req.body, { abortEarly: false });

        next();
    } catch (err) {
        return ValidationResponse(
            res,
            400,
            false,
            "Validation error",
            err.errors
        );
    }
};
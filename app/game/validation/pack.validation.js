const yup = require('yup');
export const AddPackToAssetValidation = async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            assetName: yup.string().required(),
            packNumber: yup.number().required(),
            imageurl: yup.string().required(),
            hullPoints: yup.number().required(),
        });
        await schema.validate(req.body);
        next();
    } catch (err) {
        return ValidationResponse(res, 400, false, 'validation error', err.errors.join(', '));
    }
};

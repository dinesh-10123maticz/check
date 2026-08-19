import { sendRes, ValidationResponse } from '../../shared/commonFunction';
const yup = require('yup');
export const promobuild = async (req, res, next) => {
    try {
        const validationSchema = yup.object().shape({
            buildingName: yup.string().required('buildingName required'),
            description: yup.string().required('description required'),
            image: yup.string().required('image required'),
        });

        // Validate the request body against the schema
        await validationSchema.validate(req.body);
        next(); // Proceed to the next middleware or route handler if validation succeeds
    } catch (err) {
        // Respond with a 400 error and validation message if validation fails
        return ValidationResponse(res, 409, false, 'validation error', err.errors.join(', '));
    }
};

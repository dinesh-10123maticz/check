import * as yup from 'yup';
import { FinduserById } from './user.services';
import jwt from 'jsonwebtoken';
import config from './../../config/config';
import logger from '../../utils/logger';

const schema = yup.object().shape({
    walletAddress: yup.string().required('Wallet address is required'),
    tokenName: yup.string().required('Token name is required'),
    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    transcationhash: yup.string().required('Transaction hash is required'),
});

export const depositevalidator = async (req, res, next) => {
    try {
        const validationSchema = yup.object().shape({
            walletAddress: yup.string().required('Wallet address is required'),
            tokenName: yup.string().required('Token name is required'),
            amount: yup.number().positive('Amount must be positive').required('Amount is required'),
            transactionHash: yup.string().required('Transaction hash is required'),
        });
        await validationSchema.validate(req.body);

        next(); //
    } catch (err) {
        res.status(400).json({ statusCode: 400, status: false, error: err.errors.join(', ') });
    }
};

export const verifyJWT_Token = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({ status: false, message: 'please authenticate' });
        }
        req.headers.authorization = req?.headers?.authorization.replace('Bearer ', '');

        const UseValidateToken = async (token, key) => {
            try {
                const decoded = jwt.verify(token, key);
                return decoded;
            } catch (err) {
                return null;
            }
        };

        const validate = await UseValidateToken(req?.headers?.authorization, config.SECRET_KEY);

        if (!validate) {
            return res.status(401).json({ status: false, message: 'please authenticate' });
        }

        const id = await FinduserById(new Object(validate?.id));
        if (id) {
            req.userId = id._id;
            req.userData = id;
            next();
        } else {
            return res.status(401).json({ status: false, message: 'please authenticate' });
        }
    } catch (error) {
        logger.error('AuthendicateRequest_err', error);
    }
};

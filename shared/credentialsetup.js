import config from './../config/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';
import { isEmpty } from './commonFunction';
import { Finduser, FinduserById } from '../app/user/user.services';
import logger from '../utils/logger';

export const bcyptPass = async (data) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const changepassword = await bcrypt.hash(String(data), salt);

        return changepassword;
    } catch (e) {
        return false;
    }
};

export const JWT_SIGN = (data) => {
    const token = jwt.sign({ id: data }, config.SECRET_KEY);
    return token;
};

const UseValidateToken = async (token, key) => {
    try {
        const decoded = jwt.verify(token, key);
        return decoded;
    } catch (err) {
        logger.error('UseValidateToken', err);
        return null;
    }
};

export const verifyToken = async (req, res, next) => {
    try {
        const authToken = req.headers['authorization'];
        const token = authToken;
        if (!req.headers.authorization) {
            return res
                .status(401)
                .json(Encryptdata({ status: false, message: 'please authenticate' }));
        }
        req.headers.authorization = req?.headers?.authorization.replace('Bearer ', '');
        const validate = await UseValidateToken(req?.headers?.authorization, config.SECRET_KEY);
        if (!validate) {
            return res
                .status(401)
                .json(Encryptdata({ status: false, message: 'please authenticate' }));
        }

        const id = await FinduserById(new Object(validate?.id));
        //               console.log(id , "vavav" ,validate)
        // console.log("************************************")

        if (id) {
            req.userId = id._id;
            req.userData = id;
            next();
        } else {
            return res
                .status(401)
                .json(Encryptdata({ status: false, message: 'please authenticate' }));
        }
    } catch (error) {
        console.error('AuthendicateRequest_err', error);
    }
};

export const verifyTokenforgame = async (req, res, next) => {
    try {
        const authToken = req.headers['authorization'];
        const token = authToken;
        if (!req.headers.authorization) {
            return res.status(401).json({ status: false, message: 'please authenticate' });
        }
        req.headers.authorization = req?.headers?.authorization.replace('Bearer ', '');
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
        console.error('AuthendicateRequest_err', error);
    }
};

export const originVerify = async (req, res, next) => {
    const whitelist = [
        config.SITE_URL,
        'http://localhost:3001',
        'http://localhost:3000',
        'http://localhost:3003',
        'http://localhost:3002',
        'http://nftdemo.bimaticz.com',
        'https://jamske.maticz.in',
    ];
    const origin = req.get('origin');
    if (whitelist.indexOf(origin) !== -1) {
        return next();
    } else {
        return res.status(500).json({ Status: false, message: 'Origin Failed', success: 'error' });
    }
};

export const DecryptDatas = (req, res, next) => {
    try {
        if (!isEmpty(req.query)) {
            try {
                if (req?.query?.data) {
                    const decData = CryptoJS.enc.Base64.parse(req?.query?.data)?.toString(
                        CryptoJS.enc.Utf8,
                    );
                    const bytes = CryptoJS.AES.decrypt(decData, config.Encrypt_key);

                    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                    req.query = decryptedData;

                    return next();
                } else {
                    Object.keys(req.query).map((data) => {
                        const decData = CryptoJS.enc.Base64.parse(req.query[data])?.toString(
                            CryptoJS.enc.Utf8,
                        );
                        const bytes = CryptoJS.AES.decrypt(decData, config.Encrypt_key);
                        const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                        req.query[data] = decryptedData;
                    });
                    return next();
                }
            } catch (err) {
                console.error('DecryptDatas', err);
                return next();
            }
        } else if (!isEmpty(req.body)) {
            try {
                let error = '';
                if (req.body.data) {
                    //console.log('dksjfklsfs11111', req.body.data)
                    const decData = CryptoJS.enc.Base64.parse(req.body.data)?.toString(
                        CryptoJS.enc.Utf8,
                    );
                    const bytes = CryptoJS.AES.decrypt(decData, config.Encrypt_key);
                    //console.log("bytes_bytes", bytes)
                    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                    let senddata = req;
                    senddata.body = decryptedData;
                    req.body = decryptedData;

                    return next();
                } else {
                    //console.log('dksjfklsfs2222', req.body)
                    Object.keys(req.body).map((data) => {
                        const decData = CryptoJS.enc.Base64.parse(req.body[data])?.toString(
                            CryptoJS.enc.Utf8,
                        );
                        var bytes = CryptoJS.AES.decrypt(decData, config.Encrypt_key);
                        //
                        try {
                            req.body[data] = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                        } catch (err) {
                            //
                            try {
                                req.body[data] = bytes.toString(CryptoJS.enc.Utf8);
                            } catch (dcpterr) {
                                error = dcpterr.toString();
                            }
                        }
                    });
                    //console.log('dksjfklsfs', req.body)
                    if (error) {
                        return res.json({ status: false, message: 'Error Occured', data: error });
                    } else {
                        return next();
                    }
                }
            } catch (e) {
                console.error('req body daqta err', e);
                return next();
            }
        } else next();
    } catch (err) {
        console.error('copme , req.que', err, req.query);
    }
};

export const Encryptdata = (data) => {
    // return data
    if (typeof data == 'string') {
        const encJson = CryptoJS.AES.encrypt((data), config.Encrypt_key).toString();
        const encData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson));
        return encData;
        // return  CryptoJS.AES.encrypt(data,config.Encrypt_key).toString()
    } else {
        const encJson = CryptoJS.AES.encrypt(JSON.stringify(data), config.Encrypt_key).toString();
        const encData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson));
        return encData;

        // return  CryptoJS.AES.encrypt(JSON.stringify(data),config.Encrypt_key).toString()
    }
};

// export const Decryptdata = (data) => {
//     // return data
//     try {
//         const bytes = CryptoJS.AES.decrypt(data, config.Encrypt_key);
//         console.log(bytes, "Decryptdata")
//         let decryptedData;
//         try {
//             decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
//             console.log(decryptedData, "Decryptdata")
//         } catch (err) {
//             try {
//                 decryptedData = bytes.toString(CryptoJS.enc.Utf8);
//             } catch (e) {
//                 console.log(e, "Decryptdata___err")
//                 return undefined;
//             }
//         }
//         console.log(decryptedData, "Decryptdata")
//         return decryptedData;
//     } catch (error) {
//         console.log(error, "Decryptdata__err")
//         return undefined;
//     }
// };


export const Decryptdata = (encData) => {
    try {
        // Step 1: Reverse the Base64 stringify → parse back to the AES cipher string
        const decBase64 = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(encData));
        console.log("decBase64", decBase64)
        // Step 2: AES decrypt using the same key
        const decrypted = CryptoJS.AES.decrypt(decBase64, config.Encrypt_key);
        console.log("decrypted", decrypted)
        // Step 3: Convert to UTF8 string and parse JSON
        const decString = decrypted.toString(CryptoJS.enc.Utf8);
        console.log("decString", decString, JSON.parse(decString))
        return JSON.parse(decString);
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
};
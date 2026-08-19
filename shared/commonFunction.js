import nodemailer from 'nodemailer';
import fs from 'fs';
import config from '../config/config';
import { Encryptdata } from './credentialsetup';
import { GetS3ImageStream, uploadImageToS3 } from '../services/aws';
import { uploadS3ImageToPinata } from '../services/ipfs';
import { cryptoDecryptObject, cryptoEncryptObject } from '../services/enc.service';
import { httpStatus } from '../utils/httpStatus';
import logger from '../utils/logger';
const url = require('url');
const axios = require('axios');
const sharp = require('sharp');
const util = require('util');
const path = require('path');
export const calculatePecentagevalue = (percentage, total) => {
    return (percentage / 100) * total;
};

export const GetAdminPrivatekey = async () => {
    return config.ADMIN_PRIVATE_KEY;
};

export const getAdminWalletAddress = async () => {
    return config.ADMIN_WALLETADDRRESS;
};

// export const add_minutes = (dt, minutes) => {
//     // Calculate the number of milliseconds to add
//     let millisecondsToAdd = minutes * 60 * 1000;
//     // Add the milliseconds to the current timestamp
//     let newTimestamp = dt + millisecondsToAdd;
//     // Create a new Date object with the updated timestamp
//     let newDate = new Date(newTimestamp);
//     return newDate;
//     // return new Date(dt + minutes*60000);
// };

export const add_minutes = (dt, minutes) => {
    const dateObj = new Date(dt); // Ensure dt is a Date object
    if (isNaN(dateObj.getTime())) {
        logger.error('❌ Invalid date passed to add_minutes:', dt);
        return new Date(); // Return current date as a fallback
    }

    return new Date(dateObj.getTime() + minutes * 60 * 1000);
};

export const isEmpty = (value) => {
    return (
        value === undefined ||
        value == 'undefined' ||
        value === null ||
        (typeof value === 'object' && Object.keys(value).length === 0) ||
        (typeof value === 'string' && value.trim().length === 0) ||
        (typeof value === 'string' && value === '0') ||
        (typeof value === 'number' && value === 0)
    );
};

export const Node_Mailer = async ({
    type,
    EmailId,
    subject,
    OTP,
    content,
    click,
    promo,
    QrCode,
    msg,
    bcc,
}) => {
    try {
        var content = '';
        if (isEmpty(msg)) {
            let data = {
                DBName: EmailTemplates,
                FinData: { type: type, status: false },
                SelData: { _id: 0, type: 1, content: 1, subject: 1 },
            };
            let List = await FindOne(data);
            if (List?.data?.content) {
                content = List?.data?.content;
            }
            if (!isEmpty(List?.data?.subject)) {
                subject = List?.data?.subject;
            }
        }
        if (type == 'Email-change') {
            content = msg.toString().replace(/==otp==/g, OTP);
        }

        let smtp = nodemailer.createTransport(config.keyEnvBased.emailGateway.nodemailer);
        if (!isEmpty(bcc)) {
            let info = await smtp.sendMail({
                from: config.keyEnvBased.emailGateway.fromMail, // sender address
                // to:   bcc.split(',')[0],
                bcc: bcc, // list of receivers
                subject: subject, // subject line
                html: content ? content : msg, // html body
            });
        } else {
            let info = await smtp.sendMail({
                from: config.keyEnvBased.emailGateway.fromMail, // sender address
                to: EmailId, // list of receivers
                subject: subject, // subject line
                html: content ? content : msg, // html body
            });
        }

        return true;
    } catch (E) {
        logger.error('Node_Mailer error', E);
        return false;
    }
};

export function sendResponse(res, statuscode, status, message, data = null) {
    console.log('sendResponse', statuscode, status, message, data);
    const response = {
        status: status,
        message: message,
    };
    if (data !== null) {
        response.data = data;
    }
    return res.status(statuscode).json(Encryptdata(response));
    // return res.status(statuscode).json(response);
}

export function sendGameResponseEncrpted(res, statuscode, status, message, data = null) {
    const response = {
        status: status,
        message: message,
    };
    if (data !== null) {
        response.data = data;
    }
    return res.status(statuscode).json(cryptoEncryptObject(response));
    // return res.status(statuscode).json(response);
}

/** Decrypt responceData */
export const decryptRequest = (req, res, next) => {
    try {
        const token = cryptoDecryptObject(req.body.token);
        if (isEmpty(token)) {
            return res
                .status(httpStatus.BAD_REQUEST)
                .json({ status: false, message: 'Invalid token. Please check and try again' });
        }
        req.body = JSON.parse(token);
        return next();
    } catch (e) {
        logger.error('decryptRequest_err', e);
        return res.status(500).json({ status: false, message: 'Something went wrong' });
    }
};

/** Decrypt user responceData */
export const decryptGameRequest = (req, res, next) => {
    try {
        const token = cryptoDecryptObject(req.body.token);
        if (isEmpty(token)) {
            return res.status(400).json({
                status: false,
                message: 'Please encrpt the payload and check and try again',
            });
        }
        req.body = JSON.parse(token);
        return next();
    } catch (e) {
        logger.error('decryptUserRequest_err', e);
        return res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ status: false, message: 'Something went wrong' });
    }
};

// without encrption
export function sendRes(res, statuscode, status, message, data = null) {
    if (statuscode === httpStatus.INTERNAL_SERVER_ERROR) {
        logger.error('error', data);
        logger.error('error', message);
    }
    const response = {
        statusCode: statuscode,
        status: status,
        message: message,
    };
    if (data !== null) {
        response.data = data;
    }
    return res.status(statuscode).json(response);
    // return res.status(statuscode).json(response);
}

export function ValidationResponse(res, statuscode, status, message, error) {
    const response = {
        statusCode: statuscode,
        status: status,
        message: message,
        error: error,
    };

    return res.status(statuscode).json(response);
}

export function catchresponse(res, message) {
    logger.error(message);
    return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ status: false, message: message.message });
}

export const compress_file_upload = async (compress_file) => {
    let retdata;
    if (compress_file) {
        await Promise.all(
            compress_file.map(async (item) => {
                const { data, name, mimetype } = item.files;
                await fs.promises.mkdir(item.path, { recursive: true });
                if (String(mimetype).includes('image')) {
                    sharp(data, { animated: true })
                        .webp({ quality: 80 })
                        .toFile(item.path + item.filename)
                        .then(() => {
                            return true;
                        })
                        .catch((e) => {
                            return false;
                        });
                    retdata = item.filename;
                }
                if (String(mimetype).includes('audio') || String(mimetype).includes('video')) {
                    await ffmpeg(item.fie_path)
                        .setStartTime('00:00:01')
                        .setDuration(10)
                        .output(item.path + item.filename)
                        .on('end', function (err) {
                            if (!err) {
                                return true;
                            }
                        })
                        .on('error', function (err) {
                            return false;
                        })
                        .run();
                    retdata = item.filename;
                }

                retdata = item.filename;
            }),
        );
        return retdata;
    }
};

export const ImageAddFunc = async (
    send_file,
    type,
    ProfileUrl,
    Id,
    Creator,
    alldata,
    types,
    names,
    TokenName,
    CollectionNetwork,
    CollectionUrl,
) => {
    var data;
    var newSend = await Promise.all(
        send_file.map(async (item) => {
            var nftimg = await fs.promises.mkdir(item.path, { recursive: true });
            var tokenname = await item.files.mv(item.path + item.filename);

            if (types?.toString().includes('airdrop')) {
                var promos = await Promise.all(
                    [...Array(Number(alldata.Quantity))].map(async (item) => {
                        var code = GenerateCOde(names);

                        return {
                            Code: code,
                            // QrCode  :  await QrCode(`${Config.SITE_URL}/info/drop/${CollectionNetwork}/${CollectionUrl}/${Creator}/${Id}/${Buffer.from(code).toString('base64')}`),
                            Email: '',
                            Status: 'generated',
                        };
                    }),
                );
            }
            data =
                type !== 'bulk'
                    ? item.filename
                    : {
                          file: item.filename,
                          TokenId: Id,
                          Id: Id,
                          TokenName: TokenName ? TokenName : Id,
                          ProfileUrl: ProfileUrl,
                          status: 'drop',
                          tx: '',
                          Description: '',
                          ArtistAddress: alldata.ArtistAddress,
                          ArtistUrl: alldata.ArtistUrl,
                          TokenPrice: alldata.CollectionPrice,
                          TokenOwner: Creator,
                          Quantity: alldata.Quantity,
                          Balance: alldata.Quantity,
                          promo: promos ?? [],
                          expiry: null,
                      };
        }),
    );
    return data;
};

export const ipfs_add_for_meta = async (path) => {
    try {
        const stream = await GetS3ImageStream(path);

        if (stream) {
            const fileName = path.split('/').pop();
            const ipfs = await uploadS3ImageToPinata(stream, fileName);
            if (ipfs) {
                return ipfs;
            }
        }
        return false;
    } catch (e) {
        logger.error('ipfs_add_for_meta', e);
        return false;
    }
};

export const socketSend = (statusCode, status, message, data = {}) => {
    return {
        status: status,
        statusCode: statusCode,
        message: message,
        data: data,
    };
};

export async function uploadAndGenerateUrl(data) {
    const { item, path } = data;
    try {
        const stream = await GetS3ImageStream(path);
        console.log('stream', stream, path);
        if (stream) {
            let fileName = path.split('/').pop();
            const ipfsURL = await uploadS3ImageToPinata(stream, fileName);
            if (ipfsURL) {
                console.log('ipfsURL', ipfsURL);
                return ipfsURL;
            }
        }

        return false;
    } catch (error) {
        logger.error('Error uploading file:', error);
        return false;
    }
}

export const saveIpfsData = async (url, destinationPath) => {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    if (response.status === 200) {
        return uploadImageToS3(destinationPath, response.data, response.mimetype);
    } else {
        logger.error('Failed to fetch data from the IPFS URL');
    }
};

export const signature_imageURL = (key) => {
    const cdnUrl = config.AWS_CDN_URL;
    const strurl = cdnUrl + key;
    return strurl;
};

const generateRandomAlphanumericString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
};

export const generateReferralCode = (data) => {
    const staticPart = 'GALFI';
    // const dataArray = Array.from(data.toUpperCase().replace(/\s/g, ''));
    // const randomPart1 = getRandomElementFromArray(dataArray);
    const randomPart2 = generateRandomAlphanumericString(3);
    return `${data}${staticPart}${randomPart2}`;
    // return `${staticPart}-${randomPart1}-${randomPart2}`;
};

export const yupvalidate = (validationSchema) => async (req, res, next) => {
    try {
        await validationSchema.validate(req.body);
        next();
    } catch (err) {
        return ValidationResponse(res, 400, false, 'validation error', err.errors.join(', '));
    }
};

export function multiamount(array, time) {
    const times = Number(time);
    let arr = array;
    for (let i = 0; i < arr.length; i++) {
        arr[i].amount = Math.round(array[i].amount * times * 1000000) / 1000000;
    }
    return arr;
}

export const calculateRewardforRefferedUser = (amount, refferal_Percent) => {
    return (refferal_Percent / 100) * amount;
};

export function generateRandomAlphabets(number) {
    const alphabets = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < number; i++) {
        const randomIndex = Math.floor(Math.random() * alphabets.length);
        result += alphabets[randomIndex];
    }
    return result;
}

export const chechRefferalisValid = (userData) => {
    if (userData.refferedBy) return true;

    return false;
};

/**
 * Returns the original image.
 *
 * @param {string} image - The image URL.
 *
 * @returns {string} The original image URL.
 */
export const GetOriginalImage = (image) => {
    // TODO : after uploaded the original images in s3 bucket and original/
    return image;
};

export const toLowerCase = (data) => {
    return data.toLowerCase();
};

/*
types = ['crew','panet']
CollectionContractDetails this is data from config
this func return contract address based on types
*/
export function getAddresswithTypes(types, CollectionContractDetails) {
    const arr = [];
    for (let key in CollectionContractDetails) {
        if (types.includes(CollectionContractDetails[key].type)) {
            arr.push(CollectionContractDetails[key].address.toLowerCase());
        }
    }
    return arr;
}

export function getSymbolsWithTypes(types, CollectionContractDetails) {
    const arr = [];
    for (let key in CollectionContractDetails) {
        if (types.includes(CollectionContractDetails[key].type)) {
            arr.push(CollectionContractDetails[key].symbol);
        }
    }
    return arr;
}

export function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function toFixedNumber(x) {
    try {
        if (Math.abs(x) < 1.0) {
            var e = parseInt(x.toString().split('e-')[1]);
            if (e) {
                x *= Math.pow(10, e - 1);
                x = '0.' + new Array(e).join('0') + x.toString().substring(2);
            }
        } else {
            var e = parseInt(x.toString().split('+')[1]);
            if (e > 20) {
                e -= 20;
                x /= Math.pow(10, e);
                x += new Array(e + 1).join('0');
            }
        }
        return x;
    } catch (e) {
        logger.error('toFixedNumber_err', e);
    }
}

export const formatTheUrlPath = (url) => {
    return url.replace(/ /g, '-');
};

export const restrictProduction = (req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
            error: 'Access restricted to production environment only',
        });
    }
    next();
};
export function getRandomNumberInRange(min, max) {
    // Ensure integers
    min = Math.ceil(min);
    max = Math.floor(max);

    // Random integer between min and max (inclusive)
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const filterSearchQuery = (query = {}, fields = []) => {
    let filterQuery = {};
    if (!isEmpty(query) && !isEmpty(query.search)) {
        let filterArray = [];
        for (const key of fields) {
            let filter = {};
            filter[key] = new RegExp(query.search, 'i');
            filterArray.push(filter);
        }
        filterQuery = { $or: filterArray };
    }
    return filterQuery;
};

export const paginationQuery = (query = {}) => {
    try {
        console.log('query', query, isEmpty(query));
        let pagination = {
            skip: 0,
            limit: 10,
            page: 1,
        };
        if (!isEmpty(query) && !isEmpty(query.page) && !isEmpty(query.limit)) {
            console.log('skip_limit', query);
            pagination['skip'] = (query.page - 1) * query.limit;
            pagination['limit'] = Number(query.limit);
            pagination['page'] = Number(query.page);
        }
        return pagination;
    } catch (err) {
        console.log('paginationQuery_err', err);
    }
};

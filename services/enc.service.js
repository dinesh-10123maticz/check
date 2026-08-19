import config from '../config/config.js';
import logger from './logger.js';
const crypto = require('crypto');

//  this is for game files only

/** Global variables */
const iv = Buffer.alloc(16, 0);
const secretkey = config.Encrypt_key; // 16 char

/** Encrypt the object using 'CRYPTO' (as per your C# code) */
export const cryptoEncryptObject = (plainText) => {
    try {
        plainText = JSON.stringify(plainText);
        const key = Buffer.from(secretkey, 'utf8');
        const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);

        let encrypted = cipher.update(plainText, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    } catch (e) {
        logger.error('failed in cryptoEncryptObject_err', e);

        return '';
    }
};

/** Decrypt the object using 'CRYPTO' (as per your C# code) */
export const cryptoDecryptObject = (encryptedText) => {
    try {
        const key = Buffer.from(secretkey, 'utf8');
        const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);

        let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (e) {
        logger.error('failed in cryptoDecryptObject', e);
        return '';
    }
};

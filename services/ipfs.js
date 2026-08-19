import { formatTheUrlPath } from '../shared/commonFunction';
import logger from '../utils/logger';
import config from '../config/config.js';

// import { PinataSDK } from "pinata";
const FormData = require('form-data');
const axios = require('axios');

const fs = require('fs');
const path = require('path');

const API_SECRET = config.IPFS.API_SECRET;
const API_KEY = config.IPFS.API_KEY;

export const uploadS3ImageToPinata = async (s3Stream, fileName) => {
    try {
        let form = new FormData();
        // without fileName it is not work
        form.append('file', s3Stream, {
            filename: fileName,
        });

        const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
        const config = {
            method: 'post',
            url: url,
            maxBodyLength: Infinity,
            headers: {
                pinata_api_key: API_KEY,
                pinata_secret_api_key: API_SECRET,
                ...form.getHeaders(),
            },
            data: form,
        };

        const reslt = await axios(config);
        logger.info('uploadS3ImageToPinata', reslt.data);
        console.log('uploadS3ImageToPinata', reslt.data);
        return reslt.data.IpfsHash;
    } catch (error) {
        console.log("failed in uploadS3ImageToPinata", error, error?.response?.data)
        logger.error('failed in uploadS3ImageToPinata', error);
        return false;
    }
};

export const generateMetaStoreFilePath = (walletAddress) => {
    const time = Date.now();
    return formatTheUrlPath(`ipfs/${walletAddress}/${time}.json`);
};

export const JsonToPinata = async (s3Stream, fileName) => {
    try {
        let form = new FormData();
        // without fileName it is not work
        form.append('file', s3Stream, {
            filename: fileName,
        });

        const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
        const config = {
            method: 'post',
            url: url,
            maxBodyLength: Infinity,
            headers: {
                pinata_api_key: API_KEY,
                pinata_secret_api_key: API_SECRET,
                ...form.getHeaders(),
            },
            data: form,
        };

        const reslt = await axios(config);
        logger.info('JsonToPinata', reslt.data);
        return reslt.data.IpfsHash;
    } catch (error) {
        logger.error('failed in JsonToPinata', error);
        return false;
    }
};

export const uploadTxtToPinata = async (jsonArray) => {
    const metaArray = [];

    for (const [index, json] of jsonArray.entries()) {
        try {
            // Convert JSON to a string
            const jsonString = JSON.stringify(json);

            // Create a temporary .txt file
            const fileName = `file-${index}.txt`;
            const filePath = path.join(__dirname, fileName);
            fs.writeFileSync(filePath, jsonString);

            // Prepare FormData
            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath), {
                filename: `${json.nftId}.txt`,
            });

            // Make API request to Pinata
            const response = await axios.post(
                'https://api.pinata.cloud/pinning/pinFileToIPFS',
                formData,
                {
                    maxContentLength: Infinity, // Allow large files
                    headers: {
                        ...formData.getHeaders(),
                        pinata_api_key: API_KEY,
                        pinata_secret_api_key: API_SECRET,
                    },
                },
            );

            logger.info(`Uploaded JSON #${index} as .txt:`, response.data);

            metaArray.push({
                nftId: json.nftId,
                ipfs: response.data.IpfsHash,
            });

            // Cleanup temporary file
            fs.unlinkSync(filePath);
        } catch (error) {
            logger.error(`Failed to upload JSON #${index}:`, error.message);
        }
    }
    logger.info('metaArray', JSON.stringify(metaArray));
    return metaArray;
};

export const uploadTxtToPinataParally = async (jsonArray) => {
    const uploadFile = async (json, index) => {
        const fileName = `file-${index}.txt`;
        const filePath = path.join(__dirname, fileName);

        try {
            // Convert JSON to a string
            const jsonString = JSON.stringify(json);

            // Create a temporary .txt file
            fs.writeFileSync(filePath, jsonString);

            // Prepare FormData
            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath), {
                filename: `${json.nftId}.txt`,
            });

            // Make API request to Pinata
            const response = await axios.post(
                'https://api.pinata.cloud/pinning/pinFileToIPFS',
                formData,
                {
                    maxContentLength: Infinity, // Allow large files
                    headers: {
                        ...formData.getHeaders(),
                        pinata_api_key: API_KEY,
                        pinata_secret_api_key: API_SECRET,
                    },
                },
            );

            logger.info(`Uploaded JSON #${index} as .txt:`, response.data);

            // Cleanup temporary file
            fs.unlinkSync(filePath);

            return {
                nftId: json.nftId,
                metaData: response.data.IpfsHash,
                attributes: json.attributes,
            };
        } catch (error) {
            logger.error(`Failed to upload JSON #${index}:`, error.message);

            // Cleanup temporary file in case of error
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

            return null; // Return null for failed uploads
        }
    };

    // Create an array of promises for concurrent execution
    const uploadPromises = jsonArray.map((json, index) => uploadFile(json, index));

    // Wait for all promises to resolve
    const metaArray = await Promise.all(uploadPromises);

    // Filter out any null values (failed uploads)
    const successfulUploads = metaArray.filter((meta) => meta !== null);

    logger.info('metaArray', JSON.stringify(successfulUploads));
    return successfulUploads;
};

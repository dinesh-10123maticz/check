import config from '../config/config';
import logger from '../utils/logger';
const AWS = require('aws-sdk');

const AWS_S3_Bucket = config.AWS_Bucket;

const S3INSTANCE = new AWS.S3({
    accessKeyId: config.AWS_ACCESS_KEY_ID, // Your access key id
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY, // Your secret access key
    region: config.AWS_REGION, // Your region
});

const S3INSTANCE_FOR_IPFS = new AWS.S3({
    accessKeyId: config.IPFS_S3.AWS_ACCESS_KEY_ID, // Your access key id
    secretAccessKey: config.IPFS_S3.AWS_SECRET_ACCESS_KEY, // Your secret access key
    region: config.IPFS_S3.AWS_REGION, // Your region
});

export const GetS3ImageStream = async (path) => {
    try {
        const params = {
            Bucket: AWS_S3_Bucket,
            Key: path,
        };

        let s3Stream = S3INSTANCE.getObject(params).createReadStream();
        return s3Stream;
    } catch (e) {
        logger.error('getS3ImageStream', e);
        return false;
    }
};

export const saveimageurltoS3 = async (path, imageUrl) => {
    try {
        const response = await axios({
            url: imageUrl,
            responseType: 'arraybuffer',
        });

        let time = Date.now().toString();
        const resul = await uploadImageToS3(path, response.data, response.headers['content-type']);

        if (resul.status) {
            return resul.Key;
        }
        return '';
    } catch (err) {
        logger.error(err);
        return '';
    }
};

export async function uploadImageToS3(key, fileData, filetype) {
    try {
        // Read content from the file
        // const fileContent = fs.readFileSync(filePath);
        // Setting up S3 upload parameters
        const params = {
            Bucket: config.AWS_Bucket,
            Key: key.replace(' ', ''),
            Body: fileData,
            ContentType: filetype, // Change according to the file type
        };

        // Uploading files to the bucket

        let res = await S3INSTANCE.upload(params).promise();
        res.status = true;
        return res;
    } catch (err) {
        logger.error('uploadImageToS3 ', err);
        return { status: false, message: err.message };
    }
}
export async function uploadOrUpdateIpfsToS3(key, fileData, fileType) {
    try {
        const params = {
            Bucket: config.IPFS_S3.AWS_Bucket,
            Key: key,
            Body: fileData,
            ContentType: 'application/json',
        };

        let res = await S3INSTANCE_FOR_IPFS.upload(params).promise();

        res.status = true;
        res.message = 'Uploaded / Updated successfully';
        console.log('JOSON_INININ', res);
        return res;
    } catch (err) {
        logger.error('uploadOrUpdateToS3', err);
        return { status: false, message: err.message };
    }
}

export async function uploadOrUpdateIpfsMetaToS3(key, fileData, fileType) {
    try {
        const params = {
            Bucket: config.AWS_Bucket,
            Key: key.replace(' ', ''),
            Body: fileData,
            ContentType: fileType,
        };

        let res = await S3INSTANCE_FOR_IPFS.upload(params).promise();

        res.status = true;
        res.message = 'Uploaded / Updated successfully';
        return res;
    } catch (err) {
        logger.error('uploadOrUpdateToS3', err);
        return { status: false, message: err.message };
    }
}

export const uploadVideoBufferInChunks = async (buffer, keyName) => {
    try {
        AWS.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Your access key id
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Your secret access key
            region: process.env.AWS_REGION, // Your region
        });

        // Set up upload parameters
        const uploadParams = {
            Bucket: AWS_S3_Bucket,
            Key: keyName,
            Body: buffer,
            ContentType: 'video/mp4',
        };

        // Create a managed upload
        const managedUpload = new AWS.S3.ManagedUpload({
            params: uploadParams,
            partSize: 10 * 1024 * 1024, // Set part size to 10MB
            leavePartsOnError: false, // Cleanup parts on error
        });

        // Upload the buffer in chunks
        const data = await managedUpload.promise();

        // Return the file URL
        return data;
    } catch (err) {
        logger.error('Error uploading video:', err);
        return false;
    }
};

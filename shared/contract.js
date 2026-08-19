import Web3 from 'web3';
import erc20 from '../config/ABI/erc20.json';
import bsc_erc20 from '../config/ABI/erc20_bsc.json';

import config, { CURRENT_NETWORK } from '../config/config';

import rewardAbi from '../config/ABI/reward.json';
import logger from '../utils/logger';

const contractCache = new Map();
const rewardContractCache = new Map();

const web3 = config.CHAIN_DETAILS[CURRENT_NETWORK].web3Instance;

export const Token_Balance_Calculation = async (token_Address, data, network) => {
    try {
        const ConnectContract = new web3.eth.Contract(erc20, token_Address);

        const bidAMt = await ConnectContract.methods.balanceOf(data).call();
        const amount = Web3.utils.fromWei(bidAMt, 'ether');
        return amount;
    } catch (err) {
        logger.error('Token_Balance_Calculation:Error', err.message);
    }
};

// export const getClaimabels = async (data) => {
//     try {
//         console.log('getClaimabelsData', data);
//         const { amount, tokenAddress, accoundAddress, contractAddress } = data;

//         const salt = config.salt;

//         const httpProvider = new Web3.providers.HttpProvider(
//             config.CHAIN_DETAILS[CURRENT_NETWORK].rpc_http,
//         );
//         const web3 = new Web3(httpProvider);

//         logger.info('beforesignature', web3.utils);

//         // Correct Solidity-compatible signature generation
//         const signature = web3.utils.soliditySha3(
//             { t: 'string', v: salt },
//             { t: 'uint256', v: amount },
//         );
//         logger.info('signature', signature);

//         const ConnectContract = new web3.eth.Contract(rewardAbi, contractAddress);
//         console.log('ConnectContract', ConnectContract, ConnectContract.options.address);
//         const arraybyte = await ConnectContract.methods
//             .getClaimables(amount, tokenAddress, signature)
//             .call({ from: accoundAddress });

//         console.log('arraybyte', arraybyte);
//         return arraybyte;
//     } catch (e) {
//         console.log('getClaimabelsData_err', e);
//         logger.error('getClaimabels Error:', e);
//         return null;
//     }
// };


export const getClaimabels = async (data) => {
    try {
        console.log('getClaimabelsData', data);
        const { amount, tokenAddress, accoundAddress, contractAddress, network } = data;

        const message = config.salt;

        const httpProvider = new Web3.providers.HttpProvider(
            // config.CHAIN_DETAILS[CURRENT_NETWORK].rpc_http,
            config.CHAIN_DETAILS[network].rpc_http,
        );
        const web3 = new Web3(httpProvider);
        const ConnectContract = new web3.eth.Contract(rewardAbi, contractAddress);
        console.log('ConnectContract', ConnectContract, ConnectContract.options.address);
        const nonce = await ConnectContract.methods.nonce().call({});
        console.log('nonce', nonce);

        logger.info('beforesignature', web3.utils);

        // Solidity-compatible hash
        const hash = web3.utils.soliditySha3(
            { t: 'address', v: accoundAddress },
            { t: 'uint256', v: amount },
            { t: 'string', v: message },
            { t: 'uint256', v: nonce },
        );

        logger.info('hash', hash);

        console.log("ADMIN_PRIVATE_KEY_FOR_REWARD", config.ADMIN_PRIVATE_KEY_FOR_REWARD)
        // Sign with backend private key
        const signatureObj = web3.eth.accounts.sign(
            hash,
            config.ADMIN_PRIVATE_KEY_FOR_REWARD
        );

        const signature = signatureObj.signature;

        logger.info('signature', signature);

        return {
            amount,
            nonce,
            tokenAddress,
            message,
            signature,
        };

        // const ConnectContract = new web3.eth.Contract(rewardAbi, contractAddress);
        // console.log('ConnectContract', ConnectContract, ConnectContract.options.address);
        // const arraybyte = await ConnectContract.methods
        //     .getClaimables(amount, tokenAddress, signature)
        //     .call({ from: accoundAddress });

        // console.log('arraybyte', arraybyte);
        // return arraybyte;
    } catch (e) {
        console.log('getClaimabelsData_err', e);
        logger.error('getClaimabels Error:', e);
        return null;
    }
};

export const HEXTONUMBER = (array, RPC) => {
    // const httpProvider = new Web3.providers.HttpProvider(RPC);
    // const web3 = new Web3(httpProvider);
    const returnarray = [];
    for (let i = 0; i < array.length; i++) {
        const ID = web3.utils.hexToNumber(array[i]);
        returnarray.push(ID);
    }
    return returnarray;
};

export const DataOfTranscation = async (txHash) => {
    try {
        logger.info('DataOfTranscation : txHash', txHash);

        // const httpProvider = new Web3.providers.HttpProvider(config.CHAIN_DETAILS.rpc_http);
        // const web3 = new Web3(httpProvider);

        let timedata = false;
        const timeid = setTimeout(async () => {
            timedata = true;
        }, 30000);

        let receipt = await web3.eth.getTransactionReceipt(txHash);
        let status = receipt?.status ? true : false;

        while (!status) {
            if (timedata) {
                return { status: false, message: 'Transaction Failed' };
            }

            receipt = await web3.eth.getTransactionReceipt(txHash);
            status = receipt?.status ? true : false;
        }

        clearTimeout(timeid);
        return receipt;
    } catch (err) {
        logger.error('DataOfTranscation', err);
        return { status: false, message: 'Transaction Failed' };
    }
};

export const TranscationhashStatus = async (txHash) => {
    try {
        // get receipt once
        const receipt = await web3.eth.getTransactionReceipt(txHash);

        logger.info('TranscationhashStatus', receipt);

        // If receipt is null → tx is pending
        if (!receipt) return null;

        return receipt.status; // true | false
    } catch (err) {
        logger.error('ERRRRR', err);
        return false;
    }
};

export const createMigrateSign = async (data, privateKey) => {
    try {
        const web3 = config.CHAIN_DETAILS[CURRENT_NETWORK].web3Instance;
        const signedData = web3.eth.accounts.sign(data, privateKey);
        return signedData;
    } catch (err) {
        logger.error('SignData', err);
        return null;
    }
};

export const getHashMessage = async (...data) => {
    try {
        // amount = web3.utils.toWei(amount, 'ether');
        let privateKey = await GetAdminPrivatekey();
        privateKey = privateKey.startsWith('0x') ? privateKey : '0x' + privateKey;
        // const messageHash = web3.utils.soliditySha3(
        //     { t: 'address', v: userAddress },
        //     { t: 'uint256', v: amount }
        // );
        logger.info('privateKey', privateKey, sign);

        // const ethSignedMessageHash = web3.eth.accounts.hashMessage(messageHash);
        const signature = web3.eth.accounts.sign(sign, privateKey);
        return signature.signature;
    } catch (e) {
        logger.error('Error on create migration sing', e);
    }
};

export const getContractInstance = (abi, address) => {
    try {
        const key = `${address}`;

        // return cached instance if already created
        if (contractCache.has(key)) {
            return contractCache.get(key);
        }

        const contract = new web3.eth.Contract(abi, address);

        contractCache.set(key, contract); // store it for reuse

        return contract;
    } catch (err) {
        logger.error('getContractInstance Error:', err.message);
        return null;
    }
};

export const decode18Decimal = (value) => {
    return value / 10 ** 18;
};

export const encode18Decimal = (value) => {
    return value * 10 ** 18;
};

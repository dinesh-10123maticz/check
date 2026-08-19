// import fetch from 'node-fetch';
import Web3 from 'web3';
// import router_ABI from './abi/router.json' assert { type: 'json' };
import router_ABI from './abi/router.json' with { type: 'json' };
import factory_ABI from './abi/factory_abi.json' with { type: 'json' };
import pair_ABI from './abi/pair_abi.json' with { type: 'json' };
import config, { CURRENT_NETWORK } from '../../config/config';
import logger from '../../utils/logger';
// import FACTORY_ADDRESS from "../../config/config"
import multicall_ABI from './abi/multicall_abi.json' with { type: 'json' };
import currencySchema from '../exchange/schema/currency.schema';
import { RedisGet, RedisSet } from '../../services/redisclient';
const { Interface } = require('ethers');

const BigNumber = require('bignumber.js');

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
global.fetch = fetch;

const routeraddress = config.ROUTER_ADDRESS;
const FACTORY_ADDRESS = config.FACTORY_ADDRESS;

const isEmpty = (value) =>
    value === undefined ||
    value === null ||
    (typeof value == 'number' && value === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0);

function toFixedNumber(x) {
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
        logger.info('toFixedNumber_err', e);
    }
}
function getWalletAddress() {
    return config.ADMIN_WALLETADDRRESS;
}
async function useWeb3() {
    return config.CHAIN_DETAILS[CURRENT_NETWORK].web3Instance;
}

function getRouterAddress() {
    try {
        return routeraddress;
    } catch (err) {}
}

async function GetContract() {
    const web3 = await useWeb3();
    try {
        const contract = new web3.eth.Contract(
            router_ABI,
            web3.utils.toChecksumAddress(getRouterAddress()),
        );
        return contract;
    } catch (err) {
        logger.info(err, 'GetContract__err');
    }
}

async function getContractInstance(contractAddress, abi) {
    const web3 = await useWeb3();
    try {
        const contract = new web3.eth.Contract(abi, contractAddress);
        return contract;
    } catch (err) {
        logger.info(err, 'GetContract__err');
    }
}

export const convertAmount = async (req, res) => {
    try {
        // const { amount, fromCurrency, toCurrency } = req.params;
        const { amount, fromCurrency, toCurrency } = req.body;

        // ------------------ Validation Section ------------------

        // 1️⃣ Check required params
        if (!amount || !toCurrency) {
            return res.status(400).json({
                status: false,
                message: 'Missing required parameters: amount or toCurrency.',
            });
        }

        // 2️⃣ Validate numeric amount
        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({
                status: false,
                message: 'Amount must be a valid positive number.',
            });
        }

        // 3️⃣ Validate Ethereum address format (simple regex check)
        const isValidAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);

        // Default fromCurrency if not provided
        const defaultFromCurrency = '0xcAC08FB0C62b750B43732881f7660B30D5a11A83';
        const fromAddr =
            fromCurrency && isValidAddress(fromCurrency) ? fromCurrency : defaultFromCurrency;

        if (!isValidAddress(toCurrency)) {
            return res.status(400).json({
                status: false,
                message: 'Invalid Ethereum address format for toCurrency.',
            });
        }

        // ------------------ Main Logic ------------------

        const amountsIn = toFixedNumber(numericAmount * 10 ** 18).toFixed(0);

        const addressArr = [fromAddr, toCurrency];

        const val = await multiHop(amountsIn, toCurrency);

        if (!val || !val.status) {
            return res.status(500).json({
                status: false,
                message: 'Conversion failed — unable to fetch on-chain price.',
            });
        }

        logger.info('Final Value:', val);

        return res.status(200).json({
            status: true,
            data: val,
        });
        // ------------------ End of Main Logic ------------------

        const data = await converAmount_V2(numericAmount, fromAddr, toCurrency);
        res.status(200).json(data);
    } catch (err) {
        logger.error('convertAmount__error:', err);
        return res.status(500).json({
            status: false,
            message: 'Internal Server Error.',
            error: err.message,
        });
    }
};

async function converAmount_V2(amount, fromCurrency, toCurrency) {
    try {
        const pairAddress = await getpairAddress(fromCurrency, toCurrency);
        const PAIR_INSTANCE = await getContractInstance(pairAddress, pair_ABI);

        const [reserves, token0, token1] = await Promise.all([
            PAIR_INSTANCE.methods.getReserves().call(),
            PAIR_INSTANCE.methods.token0().call(),
            PAIR_INSTANCE.methods.token1().call(),
        ]);
        // logger.info("fromaddresusd" , fromCurrency);
        // logger.info('token0', token0);
        // logger.info('token1', token1);
        // logger.info('reserves', reserves);

        let amountOut = 0;
        if (fromCurrency.toLowerCase() === token0.toLowerCase()) {
            amountOut = reserves.reserve1 / reserves.reserve0;
            // logger.info('if', amountOut);
        } else {
            amountOut = reserves.reserve0 / reserves.reserve1;
            // logger.info('else', amountOut);
        }
        // logger.info('Final amountOut', amountOut*amount );

        return {
            status: true,
            message: 'Success',
            data: { reserves, token0, token1, amount: amountOut * amount },
        };
    } catch (error) {
        logger.error('converAmount_V2_err', error);
        return { amount: 0, status: false, message: error.message };
    }
}

async function getpairAddress(tokenA, tokenB) {
    try {
        const INSTANCE = await getContractInstance(FACTORY_ADDRESS, factory_ABI);
        const pairAddress = await INSTANCE.methods.getPair(tokenA, tokenB).call();
        return pairAddress;
    } catch (error) {
        logger.error('getpairAddress_err', error);
        return null;
    }
}

export async function multiHop(amountsIn, toToken) {
    try {
        const BRIDGE_TOKEN = config.CHAIN_DETAILS.BRIDGE_TOKEN; // GALFI
        const USDT_TOKEN = config.CHAIN_DETAILS.USDT_TOKEN; // USDT
        let addressArr = [USDT_TOKEN, BRIDGE_TOKEN];
        addressArr = addressArr.includes(toToken.toLowerCase())
            ? addressArr
            : [...addressArr, toToken.toLowerCase()];
        // const val = await GetAmountsOut(addressArr, amountsIn);

        const contract = await GetContract();

        const amountOut = await contract.methods
            .getAmountsOut(amountsIn, addressArr)
            .call({ from: getWalletAddress() });
        return {
            mutihop: addressArr,
            amount: amountOut[amountOut.length - 1] / 10 ** 18,
            status: true,
        };

        //      return {
        //     mutihop : addressArr ,
        //     amount : 0,
        //     status : true
        // };
    } catch (error) {
        return {
            status: false,
            message: error.message,
        };
    }
}

export const multicall = async (abi, calls) => {
    try {
        console.log('calls', calls);

        const multi = await GetMultiCall();
        // console.log("multi", multi)

        // const itf = new ethers.utils.Interface(abi)
        const itf = new Interface(abi);
        // console.log("itf", itf)

        const calldata = calls?.map((call) => [
            call?.address?.toLowerCase(),
            itf.encodeFunctionData(call?.name, call?.params),
        ]);
        console.log('calldata', calldata);

        const { returnData } = await multi.methods.aggregate(calldata).call();
        console.log('returnData', returnData);

        const res = returnData.map((call, i) => itf.decodeFunctionResult(calls[i].name, call));
        console.log('res', res);
        return res;
    } catch (err) {
        console.log('multicall___err', err, true);
    }
};

export const GetMultiCall = async () => {
    try {
        const web3 = await useWeb3();
        const contract = new web3.eth.Contract(multicall_ABI, config.MULTICALL_ADDRESS);
        return contract;
    } catch (err) {
        console.log('GetMultiCall___err', err, true);
    }
};

export const getTokens = async () => {
    try {
        //  Get GALFI from DB
        const galfiToken = await currencySchema
            .findOne(
                { label: 'GALFI' }, // change if needed
                { address: 1, value: 1, _id: 0 },
            )
            .lean();

        if (!galfiToken) {
            return {
                status: false,
                message: 'GALFI token not found in DB',
            };
        }

        // Get all tokens except GALFI
        const tokens = await currencySchema
            .find({ label: { $ne: 'GALFI' } }, { address: 1, value: 1, _id: 0 })
            .lean();

        //  Convert GALFI with all tokens
        const results = await Promise.all(
            tokens.map((token) =>
                galfiPriceConversion(
                    galfiToken?.address,
                    token?.address,
                    `GALFI-${token.value}`,
                ).then((res) => ({
                    pair: `GALFI-${token.value}`,
                    data: res,
                })),
            ),
        );

        console.log('results', results);

        let listener = swapPairsListener();
        console.log('listener', listener);
    } catch (err) {
        console.log('getTokens_err', err);

        return {
            status: false,
            message: 'Failed to fetch tokens',
            error: err.message,
        };
    }
};

export const swapPairsListener = async () => {
    try {
        const web3 = config.CHAIN_DETAILS[CURRENT_NETWORK].web3WsInstance;

        //for price calculation
        let swapPairs = getAllPairsFromRedis();
        swapPairs = Array.from(swapPairs);
        console.log(swapPairs, 'swapPairs');
        for (const pair of swapPairs) {
            console.log(pair, 'getTokens__sub');
            const pairAddress = pair.pairaddress;
            console.log(pairAddress, 'pairAddress');
            if (!pairAddress) continue;

            // create contract with pairAddress
            const pairContract = new web3.eth.Contract(pair_ABI, pairAddress);
            console.log(pairContract.events, 'pairContract.event');
            // const AllSub = await pairContract.getPastEvents('Swap', {
            //     fromBlock: 0,
            //     toBlock: "latest"
            // })
            // console.log(AllSub, "AllSub")
            const Subscription = pairContract.events
                .Swap({
                    // filter:{from:}
                    fromBlock: 'latest',
                })
                .on('data', (event) => {
                    console.log(event, 'Subscriptionsssss', event.returnValues);
                    galfiPriceConversion(pair.token0, pair.token1, pair.pairName);
                });
            // console.log(Subscription, "Subscription_Subscription")
        }
    } catch (err) {
        console.log('swapPairsListener_err', err);
    }
};

const TokenPrice = new Map();

export const galfiPriceConversion = async (galfiToken, token, pairName) => {
    try {
        console.log('galfiPriceConversion', galfiToken, token, pairName);
        let pairaddress = await getpairAddress(galfiToken, token);
        console.log('pairaddress', pairaddress);

        if (pairaddress === config.ZEROTH_ADDRESS) {
            return {
                status: false,
                message: 'Pair does not exist',
            };
        }
        let calls = [
            {
                address: pairaddress,
                name: 'getReserves',
            },
            {
                address: pairaddress,
                name: 'token0',
            },
            {
                address: pairaddress,
                name: 'token1',
            },
        ];

        const pooldata = await multicall(pair_ABI, calls);

        if (!pooldata) {
            return {
                status: false,
                message: 'Failed to fetch pool data',
            };
        }

        const token0 = pooldata[1][0];
        const token1 = pooldata[2][0];

        const reserveA = new BigNumber(pooldata[0][0]).toNumber() / 10 ** 18;
        const reserveB = new BigNumber(pooldata[0][1]).toNumber() / 10 ** 18;
        console.log(reserveB, reserveA, token1, token0, 'galfiPriceConversion');
        let price;
        if (token0?.toLowerCase() == galfiToken?.toLowerCase()) {
            price = reserveA / reserveB;
        } else if (token1?.toLowerCase() == galfiToken?.toLowerCase()) {
            price = reserveB / reserveA;
        }
        console.log('price', price);

        let data = {
            pairaddress,
            token0,
            token1,
            reserveA: toFixedNumber(reserveA),
            reserveB: toFixedNumber(reserveB),
            price,
            pairName,
        };

        TokenPrice.set(pairName, data);

        return {
            status: true,
            data: {
                pairaddress,
                token0,
                token1,
                reserveA: toFixedNumber(reserveA),
                reserveB: toFixedNumber(reserveB),
                price,
                pairName,
            },
        };
    } catch (err) {
        console.error('galfiPriceConversion_e', err);

        return {
            status: false,
            message: 'Internal server error',
            error: err.message,
        };
    }
};

export const getAllPairsFromRedis = () => {
    try {
        return TokenPrice.values();
    } catch (err) {
        logger.error('Redis GET all pairs error', err);
        return {};
    }
};

export const getPairFromStore = (pairName) => {
    try {
        if (!TokenPrice.has(pairName)) return null;
        return TokenPrice.get(pairName);
    } catch (err) {
        logger.error('Redis GET all pairs error', err);
        return null;
    }
};

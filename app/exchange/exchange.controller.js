import { add_minutes, calculatePecentagevalue, sendRes, sendGameResponseEncrpted } from '../../shared/commonFunction';
import {
    FindOneandUpdateCurrencyService,
    addpriceCurrencyinCirculate_service,
    findCurrency_Service,
    getCurrencyData_Service,
    justwriteinCurrency,
    updateCurrencyData_Service,
} from '../admin/cms/cms.service';
import {
    alluserService,
    bulkwriteuserCurrency_service,
    findinuserCurrency,
    findUserbalance,
    updateuserbalance,
    FindUserandUpdate,
} from '../user/user.services';
import * as exchangeService from './exchange.service';
import constant from '../../shared/constant';
import CONFIG, { CURRENT_NETWORK, PRICING_API_KEY } from '../../config/config';
import { getClaimabels } from '../../shared/contract';
import logger from '../../utils/logger';
import { RedisExpire, RedisGet, RedisIncrement, RedisSet } from '../../services/redisclient';
import { getGameValues } from '../admin/adminlogin/admin.service';
const axios = require('axios');

function multiamount(array, time) {
    const times = Number(time);
    let arr = array;
    for (let i = 0; i < arr.length; i++) {
        arr[i].amount = arr[i].amount * times;
    }
    return arr;
}

export const tokenPoolList = async (req, res) => {
    try {
        const list = await exchangeService.tokenPoolList({ isActive: true });
        sendRes(res, 200, true, 'fetched ', list);
    } catch (error) {
        sendRes(res, 500, false, error.message);
    }
};
export const tokenPoolList_admin = async (req, res) => {
    try {
        const list = await exchangeService.tokenPoolList();
        sendRes(res, 200, true, 'fetched ', list);
    } catch (error) {
        sendRes(res, 500, false, error.message);
    }
};
export const changeTokenPoolStatus = async (req, res) => {
    try {
        const { _id } = req.body;
        if (!_id) {
            sendRes(res, 400, false, 'requied _id for change the visibilty ');
        }
        const exist = await exchangeService.findOnetokenPoolList({ _id: _id });
        const data = await exchangeService.tokenPoolUpdate(
            { _id: _id },
            { isActive: !exist.isActive },
        );

        sendRes(res, 200, true, `change to ${!exist.isActive ? 'visible' : 'hidden'}`, data);
    } catch (error) {
        sendRes(res, 500, false, error.message);
    }
};
export const createTokenPool = async (req, res) => {
    try {
        const data = await exchangeService.tokenPoolCreate(req.body);
        sendRes(res, 201, true, 'created successfully', data);
    } catch (error) {
        sendRes(res, 500, false, error.message);
    }
};

export const updateTokenPool = async (req, res) => {
    try {
        const {
            _id,
            payload: {
                imageUrl,
                name,
                rewardPercent,
                lockedPeriod,
                stakeCurrencyId,
                rewardCurrencyId,
            },
        } = req.body;

        const payload = {
            name: name,
            imageUrl: imageUrl,
            lockedPeriod: lockedPeriod,
            stakeCurrencyId: stakeCurrencyId,
            rewardCurrencyId: rewardCurrencyId,
            rewardPercent: rewardPercent,
        };
        const data = await exchangeService.tokenPoolUpdate({ _id: _id }, payload);
        sendRes(res, 200, true, 'updated successfully', data);
    } catch (error) {
        sendRes(res, 500, false, error.message);
    }
};

export const stackToken = async (req, res) => {
    try {
        const { poolId, amount } = req.body;
        const { userData } = req;
        // 69734ee3b3a40920c2226b9d
        console.log('poolId', poolId);
        console.log('userData', userData);
        const poolData = await exchangeService.FindOneTokenPool({ _id: poolId }); // find the plan
        console.log('poolData', poolData);
        if (!poolData) {
            return sendRes(res, 400, false, 'please give valid pool id');
        }
        const stakeCurrencyId = poolData.stakeCurrencyId._id;

        const find = { userId: userData._id, currencyId: stakeCurrencyId };

        console.log(find);
        const userCurrencyData = await findUserbalance(find); // service from user module

        if (!userCurrencyData)
            return sendRes(res, 400, false, 'please give valid pool currency id');

        if (Number(userCurrencyData.balance) < amount) {
            return sendRes(res, 400, false, 'not have enough token');
        }

        const update = { $inc: { stacked: amount, balance: -amount } }; // increate stacked amount and subract the balance

        const updated = await updateuserbalance(find, update); // service from user module

        const today = new Date();
        function addDaysToDate(today, daysToAdd) {
            const currentDate = today;
            const resultDate = new Date(currentDate);
            resultDate.setDate(resultDate.getDate() + daysToAdd);
            return resultDate;
        }

        const payload = {
            userId: userData._id,
            walletAddress: userData.WalletAddress,
            poolId: poolId,
            stakedAmount: amount,
            rewardCurrencyId: poolData.rewardCurrencyId._id,
            stakeCurrencyId: poolData.stakeCurrencyId._id,
            rewardAmount: calculatePecentagevalue(poolData.rewardPercent, amount),
            lockedOn: today,
            expire: add_minutes(Date.now(), poolData.lockedPeriod),
            //addDaysToDate(today , poolData.lockedPeriod)  // ! chnage while production
        };

        const createdstack = await exchangeService.CreateTokenStake(payload);

        sendRes(res, 200, true, 'token stacked successfully', createdstack);
    } catch (error) {
        logger.error(error);
        sendRes(res, 500, false, error.message);
    }
};

// export const claimStackedToken = async (req, res) => {
//     try {
//         const { tokenStakeId } = req.body;

//         logger.info('Claim request received', { tokenStakeId });

//         const tokenStackData = await exchangeService.FindOneTokenStake({ _id: tokenStakeId });

//         if (!tokenStackData) {
//             logger.warn('Stake not found', { tokenStakeId });
//             return sendRes(res, 404, false, 'Stake not found');
//         }

//         const now = new Date();

//         if (tokenStackData.expire > now) {
//             logger.info('Stake not yet expired', {
//                 tokenStakeId,
//                 expireAt: tokenStackData.expire,
//                 currentTime: now,
//             });
//             return sendRes(res, 400, false, 'please try later');
//         }

//         if (tokenStackData.claimed) {
//             logger.warn('Stake already claimed', { tokenStakeId });
//             return sendRes(res, 400, false, 'already claimed');
//         }

//         logger.info('Stake validation passed', {
//             tokenStakeId,
//             userId: tokenStackData.userId,
//             stakedAmount: tokenStackData.stakedAmount,
//             rewardAmount: tokenStackData.rewardAmount,
//         });

//         const rewardfind = {
//             userId: tokenStackData.userId,
//             currencyId: tokenStackData.rewardCurrencyId._id,
//         };

//         const stakefind = {
//             userId: tokenStackData.userId,
//             currencyId: tokenStackData.stakeCurrencyId._id,
//         };

//         const updateReward = {
//             $inc: { balance: Number(tokenStackData.rewardAmount) },
//         };

//         const updateStake = {
//             $inc: {
//                 balance: Number(tokenStackData.stakedAmount),
//                 stacked: -Number(tokenStackData.stakedAmount),
//             },
//         };

//         logger.info('Prepared DB updates', {
//             stakefind,
//             rewardfind,
//             updateStake,
//             updateReward,
//         });

//         await Promise.all([
//             updateuserbalance(stakefind, updateStake),
//             updateuserbalance(rewardfind, updateReward),
//             FindOneandUpdateCurrencyService(
//                 { _id: tokenStackData.rewardCurrencyId._id },
//                 { $inc: { circulateCurrency: Number(tokenStackData.rewardAmount) } },
//             ),
//             exchangeService.FindOneAndUpdateTokenStack(
//                 { _id: tokenStackData._id },
//                 { claimed: true },
//             ),
//         ]);

//         logger.info('Stake claimed successfully', {
//             tokenStakeId,
//             userId: tokenStackData.userId,
//         });

//         sendRes(res, 200, true, 'claimed successfully');
//     } catch (error) {
//         logger.error('Claim stake failed', {
//             error: error.message,
//             stack: error.stack,
//             body: req.body,
//         });

//         sendRes(res, 500, false, error.message);
//     }
// };

export const claimStackedToken = async (req, res) => {
    try {
        const { tokenStakeId } = req.body;

        logger.info('Claim request received', { tokenStakeId });

        // 🔒 Atomic claim lock
        const tokenStackData = await exchangeService.FindOneAndUpdateTokenStack(
            { _id: tokenStakeId, claimed: false },
            { claimed: true },
            { new: true },
        );

        if (!tokenStackData) {
            logger.warn('Already claimed or not found', { tokenStakeId });
            return sendRes(res, 400, false, 'Already claimed or invalid stake');
        }

        const now = new Date();

        if (tokenStackData.expire > now) {
            // rollback claimed flag
            await exchangeService.FindOneAndUpdateTokenStack(
                { _id: tokenStakeId },
                { claimed: false },
            );

            return sendRes(res, 400, false, 'please try later');
        }

        logger.info('Claim locked successfully', {
            tokenStakeId,
            userId: tokenStackData.userId,
        });

        const rewardfind = {
            userId: tokenStackData.userId,
            currencyId: tokenStackData.rewardCurrencyId._id,
        };

        const stakefind = {
            userId: tokenStackData.userId,
            currencyId: tokenStackData.stakeCurrencyId._id,
        };

        await Promise.all([
            updateuserbalance(stakefind, {
                $inc: {
                    balance: Number(tokenStackData.stakedAmount),
                    stacked: -Number(tokenStackData.stakedAmount),
                },
            }),
            updateuserbalance(rewardfind, {
                $inc: { balance: Number(tokenStackData.rewardAmount) },
            }),
        ]);

        logger.info('Stake claimed successfully', { tokenStakeId });

        return sendRes(res, 200, true, 'claimed successfully');
    } catch (error) {
        logger.error('Claim stake failed', {
            error: error.message,
            stack: error.stack,
        });

        return sendRes(res, 500, false, error.message);
    }
};

export const stackedTokenDetails = async (req, res) => {
    try {
        const { userData } = req;

        const [claimed, unclaimed, pending] = await Promise.all([
            exchangeService.findStacked({ userId: userData._id, claimed: true }),
            exchangeService.findStacked({
                userId: userData._id,
                claimed: false,
                expire: { $lt: new Date() },
            }),
            exchangeService.findStacked({
                userId: userData._id,
                claimed: false,
                expire: { $gt: new Date() },
            }),
        ]);

        const data = {
            claimed: claimed,
            unclaimed: unclaimed,
            pending: pending,
        };

        sendRes(res, 200, true, 'fetched stacked details', data);
    } catch (error) {
        sendRes(res, 500, false, error.message);
    }
};

export const getClaimable = async (req, res) => {
    try {
        const {
            body: { amount, tokenAddress, accoundAddress, contractAddress, network },
            userData,
        } = req;
        const walletAddress = userData.WalletAddress;
        console.log("amount", amount)


        if (accoundAddress.toLowerCase() != walletAddress.toLowerCase()) {
            return sendGameResponseEncrpted(res, 422, false, 'Please give valid address')
        }


        let currencyData = await exchangeService.currencyFindOne({ "address": tokenAddress })
        console.log("currencyData", currencyData)

        const gameSettings = await getGameValues();

        // if (currencyData?.label == "GALFI") {
        if ((amount / 10 ** 18) > gameSettings.maxWithdrawLimit) {
            let updUserStatus = await FindUserandUpdate({ WalletAddress: walletAddress }, { blockedStatus: 'suspended' })
            console.log("updUserStaaddresstus", updUserStatus)
            return sendGameResponseEncrpted(res, 400, false, `Withdraw amount must be less than or equal to ${gameSettings.maxWithdrawLimit}`)
        }
        // }

        const redisKey = `withdraw_hit:${walletAddress}`;

        const currentHitCount = Number(await RedisGet(redisKey)) || 0;

        if (currentHitCount >= gameSettings.withdrawHitLimit) {
            return sendGameResponseEncrpted(res, 400, false, `Withdraw hit limit reached for today. Please try again tomorrow.`);
        }

        console.log("Withdraw Hit Count:", currentHitCount);


        // if ((amount / 10 ** 18) > CONFIG.WITHDRAW_LIMIT) {
        //     return sendGameResponseEncrpted(res, 400, false, `Withdraw amount must be less than or equal to ${CONFIG.WITHDRAW_LIMIT}`)
        // }

        let userCurrencyData = await findUserbalance({ walletAddress: walletAddress, label: currencyData?.label })
        console.log("userCurrencyData", userCurrencyData)
        if ((amount / 10 ** 18) > userCurrencyData.balance) {
            return sendGameResponseEncrpted(res, 400, false, 'Withdraw amount is greater than balance')
        }

        //! check the user have the balance or not

        const byteArray = await getClaimabels({
            amount,
            tokenAddress,
            accoundAddress: walletAddress,
            contractAddress,
            network
        });

        if (byteArray) {

            const updatedHitCount = await RedisIncrement(redisKey);
            console.log("updatedHitCount", updatedHitCount);

            // set expiry only first successful withdraw
            if (updatedHitCount === 1) {
                await RedisExpire(redisKey, 60 * 60 * 24);
            }
        }

        return sendGameResponseEncrpted(res, byteArray ? 200 : 500, !!byteArray, byteArray ? 'fetched' : 'please try later', byteArray)
        // return sendRes(
        //     res,
        //     byteArray ? 200 : 500,
        //     !!byteArray,
        //     byteArray ? 'fetched' : 'please try later',
        //     { claimableData: byteArray },
        // );

        //! check the user have the balance or not

        // const byteArray = await getClaimabels({
        //     amount: amount,
        //     tokenAddress: tokenAddress,
        //     accoundAddress: walletAddress,
        //     contractAddress: contractAddress,
        //     network: network,
        // });

        // sendRes(
        //     res,
        //     byteArray ? 200 : 500,
        //     byteArray ? true : false,
        //     byteArray ? 'fetched' : 'please try later',
        //     { claimableData: byteArray },
        // );
    } catch (e) {
        // sendRes(res, 500, false, 'please try later', e.message);
        sendGameResponseEncrpted(res, 500, false, e.message);
        console.log("Error in getClaimable:", e.message);
    }
};


export const WithdrawBalance = async (req, res) => {
    try {
        const {
            body: { tokenName, amount, transactionHash },
            userData,
        } = req;

        if (!transactionHash && !amount && !tokenName) {
            // return sendRes(res, 400, false, 'invalid data');
            sendGameResponseEncrpted(res, 400, false, 'invalid data');
        }

        const walletAddress = userData.WalletAddress;
        const transcationEntrydata = {
            walletAddress: walletAddress,
            from: CONFIG.CHAIN_DETAILS[CURRENT_NETWORK].reward,
            to: walletAddress,
            action: constant.WITHDRAW,
            tokenName: tokenName,
            token: amount,
            hash: transactionHash,
        };
        const [created, updatedata] = await Promise.all([
            exchangeService.saveTrancationService(transcationEntrydata),
            updateuserbalance(
                { walletAddress: walletAddress, label: tokenName },
                { $inc: { balance: -amount } },
            ),
            exchangeService.updateCurrency(
                { label: tokenName },
                { $inc: { circulateCurrency: -amount } },
            ),
        ]);
        sendRes(res, 200, true, 'withdraw success', updatedata);
        // sendRes(res, 200, true, 'withdraw success', { balance: updatedata });
    } catch (e) {
        sendGameResponseEncrpted(res, 500, false, e.message);
    }
};

export const devUpdateUserBalance = async (req, res) => {
    let {
        body: { walletAddress, amount },
    } = req;
    try {
        walletAddress = walletAddress.toLowerCase();
        const userCur = await findinuserCurrency({ walletAddress: walletAddress });
        console.log('userCuruserCuruserCur', userCur);
        const payload = [];
        for (let i = 0; i < userCur.length; i++) {
            payload.push({
                find: { walletAddress: walletAddress, label: userCur[i].label },
                update: { $inc: { balance: amount } },
            });
        }
        const updated = await Promise.allSettled(
            payload.map((e) => updateuserbalance(e.find, e.update)),
        );
        res.send({ message: 'demo money updated', updated });
    } catch (e) {
        logger.error(e);
    }
};

export const getTranscations = async (req, res) => {
    try {
        const {
            query: { page = 1, limit = 10 },
        } = req;
        const data = await exchangeService.getTranscationService({}, page, limit);
        sendRes(res, 200, true, 'fetched successfully', data);
    } catch (e) { }
};


// export async function convertUsdToAsset({ usd, assetType }) {
//     const asset = CONFIG.CHAIN_DETAILS[CURRENT_NETWORK]?.[assetType];

//     if (!asset) {
//         throw new Error('Unsupported network or asset type');
//     }

//     const url = 'https://api.coingecko.com/api/v3/simple/price';

//     const response = await axios.get(url, {
//         params: {
//             ids: asset.id,
//             vs_currencies: 'usd',
//         },
//         timeout: 5000, // good practice
//     });
//     console.log("response data:", response.data);

//     const priceUsd = response.data?.[asset.id]?.usd;
//     console.log("Price in USD:", priceUsd);
//     if (!priceUsd) {
//         throw new Error('Failed to fetch price');
//     }

//     const amount = usd / priceUsd;

//     return {
//         usd,
//         assetType,
//         symbol: asset.symbol,
//         priceUsd,
//         amount: Number(amount.toFixed(asset.decimals)),
//     };
// }

// export async function convertUsdToAsset({ usd, assetType }) {
//     const asset = CONFIG.CHAIN_DETAILS[CURRENT_NETWORK]?.[assetType];

//     if (!asset) {
//         throw new Error('Unsupported network or asset type');
//     }

//     const now = Date.now();
//     const cached = priceCache[asset.id];

//     let priceUsd;

//     // Valid cache
//     if (cached && cached.expiry > now) {
//         priceUsd = cached.priceUsd;
//     } else {
//         try {
//             const response = await axios.get(
//                 "https://api.coingecko.com/api/v3/simple/price",
//                 {
//                     params: {
//                         ids: asset.id,
//                         vs_currencies: "usd",
//                     },
//                     timeout: 5000,
//                 }
//             );

//             priceUsd = response.data?.[asset.id]?.usd;

//             if (!priceUsd) {
//                 throw new Error("Failed to fetch price");
//             }

//             priceCache[asset.id] = {
//                 priceUsd,
//                 expiry: now + CACHE_TIME,
//             };
//         } catch (err) {
//             console.error("CoinGecko Error:", err.response?.status);

//             // Use old cached value if available
//             if (cached?.priceUsd) {
//                 console.log("Using stale cached price");
//                 priceUsd = cached.priceUsd;
//             } else {
//                 throw err;
//             }
//         }
//     }


//     const amount = usd / priceUsd;

//     return {
//         usd,
//         assetType,
//         symbol: asset.symbol,
//         priceUsd,
//         amount: Number(amount.toFixed(asset.decimals)),
//     };
// }

const CACHE_TIME = 15 * 60 * 1000; // 15 minutes
const priceCache = {};


export async function convertUsdToAsset({ usd, assetType }) {
    console.log("Converting USD to asset:", usd, assetType);
    const asset = CONFIG.CHAIN_DETAILS[CURRENT_NETWORK]?.[assetType];
    console.log("Asset details:", asset);

    if (!asset) {
        throw new Error(`Unsupported asset type: ${assetType}`);
    }

    const symbol = asset.symbol; // ETH
    console.log("symbol", symbol);

    if (!symbol) {
        throw new Error("CoinMarketCap asset mapping not found");
    }

    const now = Date.now();

    // Return cached price if available
    if (priceCache[symbol] && priceCache[symbol].expiry > now) {
        const priceUsd = priceCache[symbol].priceUsd;

        return {
            usd,
            assetType,
            symbol: asset.symbol,
            priceUsd,
            amount: Number((usd / priceUsd).toFixed(asset.decimals)),
        };
    }

    const response = await axios.get(
        "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest",
        {
            params: {
                symbol,
                convert: "USD",
            },
            headers: {
                "X-CMC_PRO_API_KEY": CONFIG.PRICING_API_KEY,
                Accept: "application/json",
            },
        }
    );
    console.log("CoinMarketCap response:", response.data)
    const priceUsd =
        response.data.data[symbol].quote.USD.price;

    // Cache the price
    priceCache[symbol] = {
        priceUsd,
        expiry: now + CACHE_TIME,
    };

    return {
        usd,
        assetType,
        symbol: asset.symbol,
        priceUsd,
        amount: Number((usd / priceUsd).toFixed(asset.decimals)),
    };
}


export const convertPrice = async (req, res) => {
    const { usd, assetType } = req.body;
    console.log("Converting price:", usd, assetType);
    // Build cache key (unique per usd + assetType)
    const cacheKey = `convert:${assetType}:${usd}`;

    try {
        // 1. Try Redis first
        const cachedResult = await RedisGet(cacheKey);

        if (cachedResult) {
            return sendRes(res, 200, true, 'Conversion successful (cached)', cachedResult);
        }

        // 2. If not in Redis → calculate
        const result = await convertUsdToAsset({ usd, assetType });

        // 3. Store in Redis (example: cache for 60 seconds)
        await RedisSet(cacheKey, result, 600);

        // 4. Return response
        sendRes(res, 200, true, 'Conversion successful', result);
    } catch (error) {
        console.log('Error in convertPrice:', error.message);
        sendRes(res, 500, false, 'Conversion failed', error.message);
    }
};

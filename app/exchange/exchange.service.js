import transcationdb from './schema/transcation.schema';
import TokenPool from './schema/tokenPool.schema';
import TokenStake from './schema/tokenstake.schema';
const currency = require('./schema/currency.schema');
export const saveTrancationService = async (data) => {
    const createtrans = await transcationdb.create(data);
    return createtrans;
};

export const TranscationService = async (data) => {
    const payload = {
        from: data.from,
        to: data.to,
        action: data.action,
        tokens: data.price,
        userassetId: data.userAssetId,
    };

    const createtrans = await transcationdb.create(payload);
    return createtrans;
};
export const tokenPoolList = async (data = {}) => {
    const resp = await TokenPool.find(data)
        .populate('stakeCurrencyId', {})
        .populate('rewardCurrencyId', {});
    return resp;
};
export const findOnetokenPoolList = async () => {
    const resp = await TokenPool.findOne()
        .populate('stakeCurrencyId', {})
        .populate('rewardCurrencyId', {});
    return resp;
};
export const tokenPoolCreate = async (data) => {
    const resp = await TokenPool.create(data);
    return resp;
};

export const tokenPoolUpdate = async (find, update) => {
    const resp = await TokenPool.findOneAndUpdate(find, update);
    return resp;
};
export const FindOneTokenPool = async (data) => {
    const resp = await TokenPool.findOne(data)
        .populate('stakeCurrencyId', {})
        .populate('rewardCurrencyId', {});
    return resp;
};

export const CreateTokenStake = async (data) => {
    return await TokenStake.create(data);
};
export const FindOneTokenStake = async (data) => {
    return await TokenStake.findOne(data)
        .populate('stakeCurrencyId', {})
        .populate('rewardCurrencyId', {});
};

export const findStacked = async (data) => {
    return await TokenStake.find(data)
        .populate('stakeCurrencyId', {})
        .populate('rewardCurrencyId', {});
};
export const FindOneAndUpdateTokenStack = async (data, update) => {
    return await TokenStake.findOneAndUpdate(data, update);
};

export const updateCurrency = async (find, update) => {
    return await currency.findOneAndUpdate(find, update);
};

export const currencyBulkWrite = async (data) => {
    return await currency.bulkWrite(data);
};

export const currencyFindOne = async (data) => {
    return currency.findOne(data).lean();
};

export const getTranscationService = async (find = {}, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const resp = await transcationdb
        .find(find)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    const total = await transcationdb.countDocuments(find);
    return { data: resp, total };
};

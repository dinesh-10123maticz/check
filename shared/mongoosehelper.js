import logger from '../utils/logger';

export const FindOneDocument = async (schema, find, select) => {
    const findOne = await schema.findOne(find).select(select);
    return findOne;
};

export const FindOneandupdate = async (schema, find, update, save) => {
    if (save) {
        return await schema.findOneAndUpdate(find, update, save);
    } else {
        return await schema.findOneAndUpdate(find, update);
    }
};

export const FindDocument = async (schema, find, select) => {
    const Find = await schema.findOne(find).select(select).lean();
    return Find;
};

export const SaveDocument = async (schema, data) => {
    const datas = await schema.create(data);
    return datas;
};

export const Aggregate = async (data) => {
    const { DBName, Query } = data;
    try {
        return await DBName?.aggregate(Query);
    } catch (e) {
        logger.error(e);
        return false;
    }
};

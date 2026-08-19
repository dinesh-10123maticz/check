const cmsschema = require('./schema/cms.schema');
const roadmapschema = require('./schema/roadmap.schema');
const faqschema = require('./schema/faq.schema');
const planetSchema = require('./schema/planet.schema');
import currencydb from '../../exchange/schema/currency.schema';
import collectionType_db from './schema/collectionType.schema';

export const FaqFindall = async () => {
    return await faqschema.find({});
};

export const FaqUpdate = async (id, question, answer) => {
    return await faqschema.findOneAndUpdate({ _id: id }, { question: question, answer: answer });
};

export const Faqcreate = async (payload) => {
    return await faqschema.create(payload);
};

export const FaqDelete = async (id) => {
    return await faqschema.findOneAndDelete({ _id: id });
};

export const FindOnecms = async (data) => {
    return await cmsschema.findOne(data);
};

export const FindOnecmsandUpdata = async (find, update) => {
    return await cmsschema.findOneAndUpdate(find, update);
};
export const FindByidcmsandUpdate = async (id, heading, description) => {
    return await cmsschema.findByIdAndUpdate(id, { heading: heading, description: description });
};

export const findroadmap = async () => {
    return await roadmapschema.find();
};

export const FindByidroadmapandUpdate = async (id, question, answer) => {
    return await roadmapschema.findByIdAndUpdate(id, { question: question, answer: answer });
};

export const allcms = async () => {
    const roadmap = await roadmapschema.find({});
    const cms = await cmsschema.find({});
    const faq = await faqschema.find({});
    const planet = await planetSchema.find({});
    const result = {
        roadmapdata: roadmap,
        cmsdata: cms,
        faqdata: faq,
        planetdata: planet,
    };

    return result;
};

export const createcurrency = async (data) => {
    const res = await currencydb.create(data);
    return res;
};
export const FindOneAndUpdateCurrency = async (find, update) => {
    return await currencydb.findOneAndUpdate(find, update);
};
export const checkcurencyexist_service = async (id) => {
    const res = await currencydb.findById(id);
    return res;
};

export const get_cuurencyList_Service = async () => {
    return await currencydb.find();
};

// service for exchange router
export const getCurrencyData_Service = async (data) => {
    return await currencydb.findOne(data);
};
// service for exchange controller
export const updateCurrencyData_Service = async (find, update) => {
    return await currencydb.findOneAndUpdate(find, update);
};
export const findCurrency_Service = async (data) => {
    return await currencydb.findOne(data);
};

export const addpriceCurrencyinCirculate_service = async (payload) => {
    let cost = payload;
    let dataforbulkwirte = [];
    for (let i = 0; i < cost.length; i++) {
        let data = cost[i];
        let a = {
            updateOne: {
                filter: {
                    $or: [{ label: data.label }, { value: data.label }, { name: data.label }],
                },
                update: { $inc: { circulateCurrency: data?.amount } },
            },
        };
        dataforbulkwirte.push(a);
    }
    return await currencydb.bulkWrite(dataforbulkwirte);
};

export const justwriteinCurrency = async (payload) => {
    return await currencydb.bulkWrite(payload);
};

export const collectiontypefind = async () => {
    return await collectionType_db.find();
};

export const Createcollectiontype = async (data) => {
    return await collectionType_db.create(data);
};

export const collectiontypeFindOne = async (data) => {
    return await collectionType_db.findOne(data);
};
export const FindOneandUpdateCurrencyService = async (find, update) => {
    return await currencydb.findOneAndUpdate(find, update);
};

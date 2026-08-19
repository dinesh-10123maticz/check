import {
    catchresponse,
    sendRes,
    sendResponse,
    signature_imageURL,
} from '../../../shared/commonFunction';
import { FindAllNewsletter } from '../../user/user.services';
import * as cmsservice from './cms.service';
import constant from '../../../shared/constant';
import { query } from 'express';
import { config } from 'dotenv';
// const constant = require('../../../shared/constant')
import serverConfig from '../../../config/config';
import { uploadVideoBufferInChunks } from '../../../services/aws';
import logger from '../../../utils/logger';
const Currency = require('../../exchange/schema/currency.schema');

export const UploadViedeo = async (req, res) => {
    try {
        const { location } = req.body;
        let time = Date.now();
        const key =
            location +
            '/' +
            time +
            '.' +
            req.files.video.name.split('.')[req.files.video.name.split('.').length - 1];
        const url = await uploadVideoBufferInChunks(req.files.video.data, key);
        const result = {
            videoKey: url?.Key,
            videoLocation: url?.Location,
        };

        sendRes(res, url ? 200 : 400, url ? true : false, url ? 'uploaded' : 'failed', result);
    } catch (error) {
        sendRes(res, 500, false, error.message);
    }
};

export const FaqList = async (req, res) => {
    try {
        const resp = await cmsservice.FaqFindall();
        logger.log(resp);
        sendResponse(res, 200, true, 'success', resp);
    } catch (error) {
        catchresponse(res, error);
    }
};

export const FaqUpdate = async (req, res) => {
    try {
        const { id, question, answer } = req.body;
        const resp = await cmsservice.FaqUpdate(id, question, answer);
        sendResponse(res, 200, true, 'success', resp);
    } catch (error) {
        catchresponse(res, error);
    }
};

export const FaqAdd = async (req, res) => {
    try {
        const { question, answer } = req.body;
        if (!question && answer) {
            return sendResponse(res, 422, true, 'validation error', req.body);
        }

        const payload = {
            question: question,
            answer: answer,
        };

        const save = await cmsservice.Faqcreate(payload);
        return sendResponse(res, 200, true, 'created successfully', save);
    } catch (error) {
        catchresponse(res, error);
    }
};

export const FaqDelete = async (req, res) => {
    try {
        const { id } = req.params;
        await cmsservice.FaqDelete({ _id: id });
        sendResponse(res, 209, true, 'deleted successfully');
    } catch (error) {
        catchresponse(res, error);
    }
};

export const CmsUpdate = async (req, res) => {
    try {
        const { id, key, heading, description } = req.body;
        if (req?.files?.cmsimage) {
            const files = req?.files?.cmsimage;
            let fileName = Date.now() + '.webp';
            const uploadPath = path.join(__dirname, `../../public/cms`, fileName);
            let test = await fs.promises.mkdir(path.resolve(__dirname, `../../public/cms`), {
                recursive: true,
            });
            files.mv(uploadPath, async (err) => {
                if (err) {
                    logger.error('Error uploading profile image:', err);
                    return res
                        .status(500)
                        .json({ success: false, message: 'Error uploading  image' });
                }

                const resp = await cmsservice.FindOnecmsandUpdata(
                    { _id: id },
                    {
                        description: req.body.description,
                        heading: req.body.heading,
                        image: fileName,
                    },
                );
                sendResponse(res, 200, true, 'cms uploaded successfully', resp);
            });
        } else {
            const data = await cmsservice.FindByidcmsandUpdate(id, heading, description);

            sendResponse(res, 200, data ? true : false, data ? 'updated!' : 'failed to update!');
        }
    } catch (error) {
        catchresponse(res, error);
    }
};

export const CmsDetails = async (req, res) => {
    try {
        const key = req.query.data;
        const resp = await cmsservice.FindOnecms({ slug: key });

        sendResponse(res, 200, true, 'cms fetched', resp);
    } catch (error) {
        catchresponse(res, error);
    }
};

export const Subcribelist = async (req, res) => {
    try {
        // !FindAllNewsletter service from user module
        const save = await FindAllNewsletter();

        sendResponse(res, 200, true, 'success', save);
    } catch (error) {
        catchresponse(res, error);
    }
};

export const RoadmapList = async (req, res) => {
    try {
        const resp = await cmsservice.findroadmap();
        sendResponse(res, 200, true, 'Roadmap fetched successfully', resp);
    } catch (error) {
        catchresponse(res, 500, false, error);
    }
};

export const RoadmapUpdate = async (req, res) => {
    try {
        const { id, question, answer } = req.body;
        const resp = await cmsservice.FindByidroadmapandUpdate(id, question, answer);

        if (resp) {
            sendResponse(res, 200, true, 'edited successfully!');
        } else {
            sendResponse(res, 200, false, 'Failed to edit!');
        }
    } catch (error) {
        catchresponse(res, error);
    }
};

export const planetlist = async (req, res) => {
    try {
        const planet = require('./schema/planet.schema');
        const create = await planet.find();
        sendResponse(res, 200, true, 'fetched', create);
    } catch (error) {
        catchresponse(res, error);
    }
};

export const planetupdate = async (req, res) => {
    try {
        const planet = require('./schema/planet.schema');
        const { _id, data } = req.body;
        const updatedvalue = await planet.findByIdAndUpdate(_id, data);
        sendResponse(
            res,
            200,
            updatedvalue ? true : false,
            updatedvalue ? 'update successfully' : 'failed to update',
            updatedvalue,
        );
    } catch (error) {
        catchresponse(res, error);
    }
};

export const cmslist = async (req, res) => {
    try {
        const results = await cmsservice.allcms();

        sendResponse(res, 200, true, 'success', results);
    } catch (error) {
        catchresponse(res, error);
    }
};

export const getCurrencyList = async (req, res) => {
    try {
        const {
            query: { type },
        } = req;

        let List = await Currency.find().lean();

        if (type === 'nft') {
            const data = [];

            for (let i = 0; i < List.length; i++) {
                if (serverConfig.currencyforNftPlatform.includes(List[i]?.label)) {
                    data.push(List[i]);
                }
            }
            data.forEach((element) => {
                element.valueofGalfi = Number(element.valueofGalfi);
            });

            return sendRes(res, 200, true, 'success', data);
        } else {
            const data = [];
            for (let i = 0; i < List.length; i++) {
                if (!serverConfig.currencyNotforGamePlatform.includes(List[i]?.label)) {
                    data.push(List[i]);
                }
            }
            data.forEach((element) => {
                element.valueofGalfi = Number(element.valueofGalfi);
            });

            return sendRes(res, 200, true, 'success', List);
        }
    } catch (error) {
        catchresponse(res, error);
    }
};

export const createcurrency = async (req, res) => {
    try {
        const data = {
            label: req.body.label,
            value: req.body.label,
            address: req.body.address.toLowerCase(),
            decimal: req.body.decimal,
            valueofGalfi: req.body.valueofGalfi,
        };
        //
        // let data =
        //   [
        //     {
        //       "name" : "Minerals" ,
        //         "label": "GFMNR",
        //         "value": "GFMNR",
        //         "decimal": 18,
        //         "address": "0x993d2616934b47b2b349ca5d256870669a75915d",
        //         "valueofGalfi": 1  ,
        //         "convertions" : []
        //     },
        //     {
        //       "name": "Ore",
        //         "label": "GFORE",
        //         "value": "GFORE",
        //         "decimal": 18,
        //         "address": "0x5f5c07b95a2ac300cced7c770719f9d8f4b42ada",
        //         "valueofGalfi": 2  ,
        //         "convertions" : []
        //     },
        //     {
        //       "name": "Hyper",
        //         "label": "HYPER",
        //         "value": "HYPER",
        //         "decimal": 18,
        //         "address": "0x11b6dca456ec0ad7b96afbd080c9e423376db285",
        //         "valueofGalfi": 3
        //         ,      "convertions" : []
        //     },

        //     {
        //       "name": "Amrita",
        //         "label": "AMRIT",
        //         "value": "AMRIT",
        //         "decimal": 18,
        //         "address": "0x749aba01588256758c0493761e74eefb432cf29c",
        //         "valueofGalfi": 5,
        //         "convertions" : []
        //     },
        //     {
        //       "name": "Tetra",

        //         "label": "TETRA",
        //         "value": "TETRA",
        //         "decimal": 18,
        //         "address": "0x692a1dbc4af3025c39238a15f509d8579cc23eed",
        //         "valueofGalfi": 6 ,
        //         "convertions" : []
        //     },
        //     {
        //       "name": "Forces",

        //       "label": "GFRCE",
        //         "value": "GFRCE",
        //         "decimal": 18,
        //         "address": "0xaec02eec5d8e199c256a17ef8f502c912b9cb4f4",
        //         "valueofGalfi": 7  ,
        //         "convertions" : []
        //     },
        //     {
        //       "name": "FOOD",

        //         "label": "GFOOD",
        //         "value": "GFOOD",
        //         "decimal": 18,
        //         "address": "0x4c0bbf423bbfb359c6e196cd1fc8c0c00e74d85c",
        //         "valueofGalfi": 8  ,
        //         "convertions" : []
        //     },
        //     {
        //       "name": "Xenobiologicals",

        //         "label": "XENOS",
        //         "value": "XENOS",
        //         "decimal": 18,
        //         "address": "0xe218df8ea76cddb0f9bd988a64024b4ccf8d9fd0",
        //         "valueofGalfi": 9  ,
        //         "convertions" : []
        //     },
        //     {
        //       "name": "Components",

        //         "label": "GFCMP",
        //         "value": "GFCMP",
        //         "decimal": 18,
        //         "address": "0x8304cdcb017f9e439b381f63f50ce80e254b3d0f",
        //         "valueofGalfi": 10,
        //         "convertions" : []
        //     },
        //     {
        //       "name": "Energy",

        //         "label": "GFNRG",
        //         "value": "GFNRG",
        //         "decimal": 18,
        //         "address": "0x3baf08757b770e398977f647f9bb319cecd6bd7c",
        //         "valueofGalfi": 10,
        //         "convertions" : []
        //     },
        //     {
        //       "name": "Exotics",

        //         "label": "GFEXO",
        //         "value": "GFEXO",
        //         "decimal": 18,
        //         "address": "0x93e75e2a6f33ea2078a27f7268a4efdab478bc38",
        //         "valueofGalfi": 10,
        //         "convertions" : []
        //     },

        //     {
        //       "name": "Alien Artifacts Common",

        //         "label": "GFAAC",
        //         "value": "GFAAC",
        //         "decimal": 18,
        //         "address": "0xfef764b7e6fb005db228ea242e5decbdc331c690",
        //         "valueofGalfi": 10,
        //         "convertions" : []
        //     },
        //     {
        //       "name": "Alien Artifacts Ascendant",

        //         "label": "GFAAA",
        //         "value": "GFAAA",
        //         "decimal": 18,
        //         "address": "0xf5a7795001ec343172cdf52668ade8d6b285a11c",
        //         "valueofGalfi": 10,
        //         "convertions" : []
        //     },
        //     {
        //       "name": "Alien Artifacts Rare",

        //         "label": "no data need to create",
        //         "value": "GFAAR",
        //         "decimal": 18,
        //         "address": "0xf5a7795001ec343172cdf52668ade8d6b285a11c",
        //         "valueofGalfi": 10,
        //         "convertions" : []
        //     },
        //   //   {

        //   //     "label": "GFCAP",
        //   //     "value": "GFCAP",
        //   //     "decimal": 18,
        //   //     "address": "0xc4d32e29e0e66333ea5bd7207a55f6c877871081",
        //   //     "valueofGalfi": 4,
        //   //     "convertions" : []
        //   // },

        // ]

        const result = await cmsservice.createcurrency(data);
        res.status(200).json({
            status: result ? true : false,
            message: result ? 'created successfully' : 'failed',
            data: result,
        });
    } catch (err) {
        catchresponse(res, err);
    }
};

export const changeCurrencyStatus = async (req, res) => {
    try {
        const { find, update } = req.body;
        if (!find || !update) {
            return sendRes(res, 400, false, 'please provide all the required fields');
        }

        const result = await cmsservice.FindOneAndUpdateCurrency(find, update);

        res.status(200).json({
            status: result ? true : false,
            message: result ? 'updated successfully' : 'failed',
            data: result,
        });
    } catch (err) {
        catchresponse(res, err);
    }
};

export const GET_collectiontype = async (req, res) => {
    try {
        const { type } = req.body;
        const result = await cmsservice.collectiontypefind();
        result.forEach((element) => {
            if (element.image) {
                element.image_url = signature_imageURL(element.image);
            }
        });
        sendRes(res, 200, true, `fetched ${type} collections`, result);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

export const Createcollectiontype = async (req, res) => {
    try {
        const { type, imageUrl } = req.body;
        if (!type) {
            return sendRes(res, 500, false, 'all fields are required type name');
        }
        const pay = {
            type: type,
            image: imageUrl,
            image_url: imageUrl,
        };
        const result = await cmsservice.Createcollectiontype(pay);

        sendRes(res, 200, true, `created ${type} collections`, result);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

export const sociallist = async (req, res) => {
    try {
        const data = await cmsservice.FindOnecms({ slug: 'social' });

        sendRes(res, 200, true, `Social list fetched successfully `, data);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

export const updateSocial = async (req, res) => {
    try {
        const data = await cmsservice.FindOnecmsandUpdata({ slug: constant.SOCIALSLUG }, req.body);

        sendRes(res, 200, true, `updated social  successfully `, data);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

import { sendRes, sendResponse } from '../../../shared/commonFunction';
import logger from '../../../utils/logger';
import * as gameservice from '../game.service';
import * as packService from '../services/pack.service';

export const createPack = async (req, res) => {
    try {
        const {
            body: { packNumberFrom, packNumberTo },
        } = req;
        if (packNumberFrom === 0) return sendRes(res, 200, false, 'pack number can`t be zero');
        const arr = [];
        for (let i = packNumberFrom; i <= packNumberTo; i++) {
            arr.push({ packNumber: i });
        }

        const data = await packService.InsertMany(arr);
        sendRes(res, 200, true, 'pack created', data);
    } catch (error) {
        sendRes(res, 400, false, 'something went wrong', error);
    }
};

/*
    this function is used to add pack to asset and level collection with the pack id
*/
export const AddPackToAsset = async (req, res) => {
    const {
        body: { packNumber, assetName, imageurl, hullPoints, description },
    } = req;
    try {
        const exist = await packService.FindOnePack({ packNumber: packNumber });
        if (!exist) return sendResponse(res, 200, false, 'pack not exist');
        const sym = assetName.trim().replace(' ', '').toLowerCase();
        const payload = {
            asset_Name: assetName,
            asset_Symbol: sym,
            buildSlotType: 'all',
            packId: exist._id,
            isBuilding: false,
            commonplanetbuildlimit: 1,
            uncommonplanetbuildlimit: 1,
            rareplanetbuildlimit: 1,
            commonasteroidbuildlimit: 1,
            uncommonasteroidbuildlimit: 1,
            rareasteroidbuildlimit: 1,
        };

        const assetData = await gameservice.createAsset(payload);

        const level = {
            assetId: assetData._id,
            asset_Name: assetName,
            asset_Symbol: sym,
            reward: [],
            image_url: imageurl,
            image: imageurl,
            description: description,
            HullPoints: hullPoints,
        };

        await gameservice.createLevelforAsset(level);

        return sendRes(res, 200, true, 'asset created', { assetData, level });
    } catch (error) {
        logger.error(error);
        sendRes(res, 400, false, 'something went wrong', error);
    }
};

export const getPack = async (req, res) => {
    try {
        const data = await packService.FindPack({});
        sendRes(res, 200, true, 'pack list', data);
    } catch (error) {
        sendRes(res, 400, false, 'something went wrong', error);
    }
};

export const updateThePackForAstroidAndPlanet = async (req, res) => {
    try {
        const {
            body: { packNumber, ids },
        } = req;
        const pack = await packService.FindOnePack({ packNumber: packNumber });
        if (!pack) return sendRes(res, 409, false, 'pack not exist');
        await gameservice.UpdateManyPlanetAsset({ _id: { $in: ids } }, { packId: pack._id });
        sendRes(res, 200, true, 'pack updated for the planets', pack);
    } catch (error) {
        logger.error(error);
    }
};

export const TEMP_CHANGE = async (req, res) => {
    try {
        const {
            body: { packNumber },
        } = req;
        const pack = await packService.FindOnePack({ packNumber: packNumber });
        if (!pack) return sendRes(res, 409, false, 'pack not exist');
        await gameservice.UpdateManyPlanetAsset({}, { packId: pack._id });
        sendRes(res, 200, true, 'pack updated for tphe planets', pack);
    } catch (error) {
        logger.error(error);
    }
};

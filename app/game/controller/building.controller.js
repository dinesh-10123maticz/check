import { uploadImageToS3 } from '../../../services/aws';
import { multiamount, sendRes } from '../../../shared/commonFunction';
import { getGameValues } from '../../admin/adminlogin/admin.service';
import * as gameservice from '../game.service';
import { RedisGet, RedisSet } from '../../../services/redisclient';
import { galfiDataBuilding } from '../../../config/data/building.data';

const redisExpireTime = 60 * 2; // 2 minutes

export const buildinglist = async (req, res) => {
    try {
        const list = await RedisGet('buildinglist');
        if (list) {
            return sendRes(res, 200, true, 'building list', list);
        }
        const result = await gameservice.findBuildings();
        sendRes(res, 200, true, 'building list', result);
        await RedisSet('buildinglist', result, redisExpireTime);
    } catch (e) {
        sendRes(res, 500, false, error.message);
    }
};

export const addAsset = async (req, res) => {
    try {
        const {
            name,
            rows,
            columns,
            imageKey,
            commonPlanetBuildLimit,
            unCommonPlanetBuildLimit,
            quote,
            rarePlanetBuildLimit,
            commonAsteroidBuildLimit,
            unCommonAsteroidBuildLimit,
            rareAsteroidBuildLimit,
            description,
            specialConditions,
            Blocks,
            reward,
            cost,
            dailyConsumption,
            optionalCost,
            HullPoints,
            AttackPoints,
            build_time_min,
            buildSlotType,
            packId,
        } = req.body;

        const exist = await gameservice.checkexistAsset(name);
        if (exist) {
            return res.status(409).json({
                statusCode: 409,
                status: false,
                message: 'asset already exist with this level and name',
            });
        }
        if (!imageKey) {
            return res
                .status(409)
                .json({ statusCode: 409, status: false, message: 'imageKey need for this level' });
        }

        const payload = {
            asset_Name: name,
            asset_Symbol: name.trim().replace(' ', '').toLowerCase(),
            rows: rows,
            columns: columns,
            commonplanetbuildlimit: commonPlanetBuildLimit,
            uncommonplanetbuildlimit: unCommonPlanetBuildLimit,
            rareplanetbuildlimit: rarePlanetBuildLimit,
            commonasteroidbuildlimit: commonAsteroidBuildLimit,
            uncommonasteroidbuildlimit: unCommonAsteroidBuildLimit,
            rareasteroidbuildlimit: rareAsteroidBuildLimit,
            quote: quote,
            buildSlotType: buildSlotType,
            buildLandType: buildLandType,
            buildOnTypeSlot: buildOnTypeSlot,
            // planetId : planetId ,
        };

        if (packId) {
        }

        // throw new Error("")
        const create = await gameservice.createAsset(payload);

        const lvlpay = {
            image: imageKey,
            image_url: imageKey,
            assetId: create._id,
            asset_Name: name,
            asset_Symbol: name.trim().replace(' ', '').toLowerCase(),
            level: 1,
            reward: reward,
            Blocks: Blocks,
            description: description,
            // planetId : planetId ,
            specialConditions: specialConditions,
            cost: cost,
            AttackPoints: AttackPoints,
            HullPoints: HullPoints,
            optionalCost: optionalCost,
            dailyConsumption: dailyConsumption,
            build_time_min: build_time_min,
        };

        const createdlevel = await gameservice.createLevelforAsset(lvlpay);
        sendRes(res, 201, true, 'Asset created successfully', createdlevel);
    } catch (error) {
        sendRes(res, 500, false, error.message);
    }
};
// v3 version
export const addAssetAndAutoLevel = async (req, res) => {
    try {
        for (let i = 0; i < galfiDataBuilding.length; i++) {
            let {
                name,
                rows,
                columns,
                imageKey,
                imagePath,
                commonPlanetBuildLimit,
                unCommonPlanetBuildLimit,
                quote,
                rarePlanetBuildLimit,
                commonAsteroidBuildLimit,
                unCommonAsteroidBuildLimit,
                rareAsteroidBuildLimit,
                description,
                specialConditions,
                Blocks,
                reward,
                cost,
                dailyConsumption,
                optionalCost,
                HullPoints,
                AttackPoints,
                build_time_min,
                buildSlotType,
                buildOnTypeSlot,
                buildLandType,
                packId,
                levelLimit,

            } = galfiDataBuilding[i];

            const exist = await gameservice.checkexistAsset(name);
            if (exist) {
                return res.status(409).json({
                    statusCode: 409,
                    status: false,
                    message: 'asset already exist with this level and name',
                });
            }
            if (!imagePath) {
                return res.status(409).json({
                    statusCode: 409,
                    status: false,
                    message: 'imagePath need for this level',
                });
            }
            imagePath = `building/original/` + imagePath + '/';
            const payload = {
                asset_Name: name.trim(),
                asset_Symbol: name.trim().replace(' ', '').toLowerCase(),
                rows: rows,
                columns: columns,
                levelLimit,
                commonplanetbuildlimit: commonPlanetBuildLimit,
                uncommonplanetbuildlimit: unCommonPlanetBuildLimit,
                rareplanetbuildlimit: rarePlanetBuildLimit,
                commonasteroidbuildlimit: commonAsteroidBuildLimit,
                uncommonasteroidbuildlimit: unCommonAsteroidBuildLimit,
                rareasteroidbuildlimit: rareAsteroidBuildLimit,
                quote: quote,
                buildSlotType: buildSlotType,
                buildLandType: buildLandType,
                buildOnTypeSlot: buildOnTypeSlot,
                // planetId : planetId ,
            };

            // throw new Error("")
            const create = await gameservice.createAsset(payload);

            // imageKey is path need
            const lvlpay = {
                image: imagePath.concat('1.png'),
                image_url: imagePath.concat('1.png'),
                assetId: create._id,
                asset_Name: name,
                asset_Symbol: name.trim().replace(' ', '').toLowerCase(),
                level: 1,
                reward: reward,
                Blocks: Blocks,
                description: description,
                // planetId : planetId ,
                specialConditions: specialConditions,
                cost: cost,
                AttackPoints: AttackPoints,
                HullPoints: HullPoints,
                optionalCost: optionalCost,
                dailyConsumption: dailyConsumption,
                build_time_min: build_time_min,
            };

            const createdlevel = await gameservice.createLevelforAsset(lvlpay);

            for (let i = 2; i <= create.levelLimit; i++) {
                const resquest = {
                    body: { assetId: create._id, imageKey: imagePath.concat(i + '.png') },
                };
                const response = {
                    statusCode: null,
                    data: null,

                    status(code) {
                        this.statusCode = code;
                        return this; // 👈 return itself to allow chaining
                    },

                    json(data) {
                        this.data = data;
                        return this; // 👈 optional, for chaining or testing
                    },
                };

                await autoaddlevel(resquest, response);

                // res.status(statuscode).json(response);
            }
        }

        sendRes(res, 201, true, 'Asset created successfully');
    } catch (error) {
        sendRes(res, 500, false, error.message);
    }
};
/**
 * Asynchronously adds a new level to the game based on the given asset ID.
 *need asset id and image for the new level
 * @param {Object} req - The request object containing the asset ID in the body.
 * @param {Object} res - The response object.
 * @return {Promise} A Promise that resolves with the created level data if successful, or an error message if unsuccessful.
 */
export const autoaddlevel = async (req, res) => {
    try {
        const { assetId, imageKey } = req.body;

        const leveldatas = await gameservice.findLevels({ assetId: assetId });

        const assetdetails = await gameservice.findOne_level_db({
            assetId: assetId,
            level: leveldatas.length,
        });
        if (!assetdetails) {
            return sendRes(res, 409, false, 'invalid asset', {});
        }

        // ! service from admin module
        const gameSettings = await getGameValues();

        const reward = multiamount(assetdetails.reward, gameSettings.rewardTimes);
        // const optionalCost = multiamount(assetdetails.optionalCost, gameSettings.costTimes);
        // const cost = multiamount(assetdetails.cost, gameSettings.costTimes);

        let cost = multiamount(assetdetails.cost, gameSettings.costTimes);
        let optionalCost = multiamount(assetdetails.optionalCost, gameSettings.costTimes);

        if (assetdetails.asset_Name === "COLONY HQ" && assetdetails.level === 1) {
            cost = [
                { label: "GFORE", amount: 200 },
                { label: "GFMNR", amount: 200 },
            ];

            optionalCost = [
                { label: "GALFI", amount: 0 },
            ];
        }


        // const consumption = multiamount(assetdetails.dailyConsumption, gameSettings.consumabelTimes)

        const dailyConsumption = multiamount(
            assetdetails.dailyConsumption,
            gameSettings.consumabelTimes,
        );

        const payload = {
            asset_Name: assetdetails.asset_Name,
            asset_Symbol: assetdetails.asset_Symbol,
            image: imageKey,
            image_url: imageKey,
            assetId: assetId,
            reward: reward,
            Blocks: assetdetails?.Blocks,
            level: leveldatas.length + 1,
            description: assetdetails.description,
            planetId: assetdetails.planetId,
            specialConditions: assetdetails.specialConditions,
            cost: cost,
            AttackPoints: assetdetails.AttackPoints,
            HullPoints: assetdetails.HullPoints,
            optionalCost: optionalCost,
            dailyConsumption: dailyConsumption,
            build_time_min: assetdetails.build_time_min,
        };

        const createdlevel = await gameservice.createLevelforAsset(payload);
        let find = {
            levelId: assetdetails._id,
        };
        let update = {
            next: createdlevel._id,
        };
        await gameservice.updateManyUserAsset(find, update);

        sendRes(res, 201, true, 'level creted successfully', createdlevel);
    } catch (error) {
        sendRes(res, 500, false, error.message, {});
    }
};

/**
 * Creates a build in the database. If a build with the given wallet address and build ID already exists, it updates the existing build.
 *
 * @param {Object} req - The request object containing the build data in the body.
 * @param {Object} res - The response object.
 * @return {Promise<Object>} The response object with a status code, status, message, and data.
 * @throws {error} If there is an error during the creation or update of the build.
 *  const { name , walletaddress , level , x , y , rows , columns , buildId } = req.body
 */

export const addLevel = async (req, res) => {
    try {
        const {
            assetId,
            description,
            specialConditions,
            Blocks,
            reward,
            cost,
            dailyConsumption,
            optionalCost,
            HullPoints,
            AttackPoints,
            build_time_min,
            imageKey,
        } = req.body;

        const assetdetails = await gameservice.findAssetbyid(assetId);

        if (!assetdetails) {
            sendRes(res, 409, false, 'invalid asset', {});
        }
        const leveldatas = await gameservice.findOneleveldb_service({ assetId: assetId });
        if (!imageKey) {
            return sendRes(res, 409, false, 'image need for this level');
        }

        const payload = {
            asset_Name: assetdetails.asset_Name,
            asset_Symbol: assetdetails.asset_Symbol,
            image: imageKey,
            image_url: imageKey,
            assetId: assetId,
            reward: reward,
            Blocks: Blocks,
            level: leveldatas.length + 1,
            description: description,
            planetId: planetId,
            specialConditions: specialConditions,
            cost: cost,
            AttackPoints: AttackPoints,
            HullPoints: HullPoints,
            optionalCost: optionalCost,
            dailyConsumption: dailyConsumption,

            build_time_min: build_time_min,
        };

        const createdlevel = await gameservice.createLevelforAsset(payload);

        return sendRes(res, 201, true, 'level creted successfully', createdlevel);
    } catch (error) {
        sendRes(res, 500, false, error.message, {});
    }
};

export const EditAssetlevel = async (req, res) => {
    try {
        const {
            levelId,
            level,
            description,
            specialConditions,
            Blocks,
            reward,
            cost,
            dailyConsumption,
            optionalCost,
            HullPoints,
            AttackPoints,
            build_time_min,
        } = req.body;

        let imageUpload = '';
        let key = '';
        if (req.files.image) {
            let time = Date.now();
            key =
                'gameassets/' +
                time +
                '.' +
                req.files.image.name.split('.')[req.files.image.name.split('.').length - 1];

            imageUpload = await uploadImageToS3(key, req.files.image.data, req.files.mimetype);
        }

        const levelPayload = {
            level: level,
            reward: reward,
            Blocks: Blocks,
            description: description,
            specialConditions: specialConditions,
            cost: cost,
            AttackPoints: AttackPoints,
            HullPoints: HullPoints,
            optionalCost: optionalCost,
            dailyConsumption: dailyConsumption,
            build_time_min: build_time_min,
        };
        if (req.files.image) {
            levelPayload.image = imageUpload.message.key;
            levelPayload.image_url = imageUpload.message.Location;
        }
    } catch (error) {
        sendRes(res, 500, false, error.message, {});
    }
};

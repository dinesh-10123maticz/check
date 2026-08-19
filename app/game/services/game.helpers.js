import { getSurveyMissionResource } from '../../missions/mission.controller';
import nearByPlanetSchema from '../schema/nearByPlanet.schema';
import planetAssetdb from '../schema/planet.schema';
import config from '../../../config/config';
import { getRandomNumber } from '../../../shared/commonFunction';

// used to create near by planet for the nft planet it is used in the place where user mint the planet nft
export const createNearByPlanet = async (parentPlanetId, hexId, RARE = 'rare', userData) => {
    const payload = [];
    const planetOnHex = await planetAssetdb.find({
        hexId: hexId,
        rarity: 'common',
        type: 'asteroid',
    });
    for (let i = 0; i < config.NEAR_BY_PLANT_COUNT.lowest; i++) {
        const planet = planetOnHex[getRandomNumber(0, planetOnHex?.length - 1)];
        const data = {
            name: Date.now(),
            description: planet?.description,
            image: planet?.image,
            image_url: planet?.image_url,
            parentPlanetId: parentPlanetId,
            acquiredBy: userData._id,
            hexId: hexId,
            planetResources: getSurveyMissionResource(),
        };
        payload.push(data);
    }

    await nearByPlanetSchema.insertMany(payload);
};

export const AddParentPlanetIdToNearByPlanet = async (parentPlanetId, hexId, rarity) => {
    const planet = await nearByPlanetSchema.updateMany(
        { hexId: hexId },
        { parentPlanetId: parentPlanetId },
    );
};

export const addAdditionalNearByPlanetOnMint = async (payload) => {
    console.log("payload:", payload);
    let count =
        config.NEAR_BY_PLANT_COUNT[payload.type][payload.rarity] ??
        config.NEAR_BY_PLANT_COUNT.lowest;

    if (count === config.NEAR_BY_PLANT_COUNT.lowest) {
        return null; //dont need to add any nearby planet
    }
    const existingPlanetCount = await nearByPlanetSchema.find({ hexId: payload.hexId });
};

import { sendRes, signature_imageURL } from '../../../shared/commonFunction';
import * as gameservice from '../game.service';

export const addcrew_NFTASSET = async (req, res) => {
    try {
        const {
            name,
            crewType,
            profession,
            rarity,
            imageKey,
            price,
            gender,
            collectionId,
            NFTProperties,
        } = req.body;

        const payload = {
            name: name,
            crewType: crewType.toLowerCase(),
            rarity: rarity,
            image_url: imageKey,
            image: imageKey,
            price: price,
            gender: gender,
            collection: collectionId,
            profession: profession,
            NFTProperties: NFTProperties ? NFTProperties : [],
        };
        const resul = await gameservice.save_crewAsset(payload);

        return sendRes(
            res,
            resul ? 201 : 200,
            resul ? true : false,
            resul ? 'created' : 'failed',
            resul,
        );
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

export const crewData = async (req, res) => {
    try {
        const {
            params: { id },
        } = req;

        const data = await gameservice.getCrewData(id);
        data.image_url = signature_imageURL(data.image);
        return sendRes(res, 200, true, 'fetched', data);
    } catch (error) {
        return sendRes(res, 500, false, error.message);
    }
};

export const crewList = async (req, res) => {
    try {
        const data = await gameservice.getAllCrewAsset();
        sendRes(res, 200, true, 'fetched', data);
    } catch (error) {
        sendRes(res, 500, false, error.message);
    }
};

export const autoCrewInsert = async (req, res) => {
    let {
        body: { NFTProperties, price, gender, collectionId, profession, from, to, rarity },
    } = req;
    try {
        const insertArray = [];
        const imgaepath = profession.toLowerCase().replace(' ', '_');
        for (let i = from; i <= to; i++) {
            const payload = {
                name: `${imgaepath}#${i}`,
                crewType: profession.toLowerCase().replace(' ', '_'),
                rarity: rarity.toLowerCase(),
                image_url: `crew/${imgaepath}/${i}.png`,
                image: `crew/${imgaepath}/${i}.png`,
                price: price,
                gender: gender,
                collection: collectionId,
                profession: profession.toLowerCase().replace(' ', '_'),
                NFTProperties: NFTProperties,
            };
            insertArray.push(payload);
        }

        const create = await gameservice.CrewDataInsertMany(insertArray);
        sendRes(res, 201, true, 'crew inserted successfully', create);
    } catch (error) {
        sendRes(res, 500, false, error.message, {});
    }
};

import { sendRes } from '../../shared/commonFunction';
import * as gameservice from '../game/game.service';
import constants from '../../shared/constant';
import { getSurveyMissionResource } from '.././missions/mission.controller';
import nearByPlanetSchema from '.././game/schema/nearByPlanet.schema';
import planetAssetdb from '.././game/schema/planet.schema';
import config from '../../config/config';
import { getRandomNumber } from '../../shared/commonFunction';
import { SHIP_DATA } from './datas/ship.data';
import { CREW_DATA } from './datas/crew.data';
import { currencyBulkWrite } from '../exchange/exchange.service';
import planetdb from "../game/schema/planet.schema"
import crewdb from "../game/schema/crew.schema"
import { InsertManyMissionReward } from '../missions/mission.service';
const Profession = require('../profession/profession.schema'); // adjust path if needed
const professions = require('../scripts/datas/seedProfessions.data');

const warpNumber = (n, range) => {
    return ((n - 1) % range) + 1;
};

const warpRange = (n, start, end) => {
    const size = end - start + 1;
    return start + ((n - 1) % size);
};

// used to create planet and astroid at a stretch
// based on the range provided in the payload
// the range for ex : 40 , 60 , 100
// if range is 40 when the i is 41 it return 1 with this need dont need duplicate images

// export const autoEntryPlantorAstroid = async (req, res) => {
//     try {
//         let hexId = 1;
//         const bodyPayload = [
//             {
//                 range: 40,
//                 from: 1,
//                 to: 1000,
//                 customPrefixName: (id) => `RARE PLANET - ${id}`,
//                 description:
//                     'Rare planets represent the premium tier of the 5K collection — designed for advanced expansion, higher efficiency, and superior strategic potential. Land Build Slots: 20, Orbit Build Slots: 3, Lagrange Space Slots: 3, Sun (Megastructure) Slots: 2, GFMNR Slots: 2, GFORE Slots: 2, AMRITA Slots: 1, TETRA Slots: 1, Specialist Slots: 3. Rare planets provide the highest flexibility and resource potential, making them ideal for late-game progression and large-scale construction strategies.',
//                 collectionId: '667e91d91ea449904060390f',
//                 type: 'planet',
//                 rarity: 'rare',
//                 coinName: 'usd',
//                 defaultNftPrice: 129,
//                 hexId: 1,
//             },
//             {
//                 range: 60,
//                 from: 1,
//                 to: 1500,
//                 customPrefixName: (id) => `UNCOMMON PLANET - ${id}`,
//                 description:
//                     'Uncommon planets introduce greater expansion capabilities and additional resource-building opportunities, offering a more strategic advantage for players. Land Build Slots: 15, Orbit Build Slots: 2, Lagrange Space Slots: 2, Sun (Megastructure) Slots: 1, GFMNR Slots: 1, GFORE Slots: 1, AMRITA Slots: 0, TETRA Slots: 1, Specialist Slots: 3. Uncommon planets allow for a stronger infrastructure, enabling players to scale their resource operations faster and build more complex systems.',
//                 collectionId: '667e91d91ea449904060390f',
//                 type: 'planet',
//                 rarity: 'uncommon',
//                 coinName: 'usd',
//                 defaultNftPrice: 99,
//                 hexId: 1001,
//             },

//             {
//                 range: 100,
//                 from: 1,
//                 to: 2500,
//                 customPrefixName: (id) => `COMMON PLANET - ${id}`,
//                 description:
//                     'Common planets are the foundational tier of the 5K planet collection. Each Common planet offers balanced opportunities for early-stage development and resource generation. Land Build Slots: 10, Orbit Build Slots: 1, Lagrange Space Slots: 1, Sun (Megastructure) Slots: 1, GFMNR Slots: 1, GFORE Slots: 1, AMRITA Slots: 0, TETRA Slots: 0, Specialist Slots: 3. Common planets serve as great starting points for players to begin constructing resource facilities and experimenting with planetary management.',
//                 collectionId: '667e91d91ea449904060390f',
//                 type: 'planet',
//                 rarity: 'common',
//                 coinName: 'usd',
//                 defaultNftPrice: 78,
//                 hexId: 2501,
//             },

//             {
//                 range: 100,

//                 from: 1,
//                 to: 2500,
//                 customPrefixName: (id) => `COMMON ASTEROID - ${id}`,
//                 description:
//                     'Common asteroids are entry-level mining bodies in the Asteroid collection — perfect for foundational resource extraction and basic orbital operations. Land Build Slots: 2, Orbit Build Slots: 1, Lagrange Space Slots: 1, Sun (Megastructure) Slots: 0, GFMNR Slots: 0, GFORE Slots: 1, AMRITA Slots: 0, TETRA Slots: 0, Specialist Slots: 3. Common asteroids are cost-effective starting points for resource gathering and early trade setups.',
//                 collectionId: '6929971d627f311dcb47bb37',
//                 type: 'asteroid',
//                 rarity: 'common',
//                 coinName: 'usd',
//                 defaultNftPrice: 19,
//                 hexId: 5001,
//             },
//             {
//                 range: 60,
//                 from: 1,
//                 to: 1500,
//                 customPrefixName: (id) => `UNCOMMON ASTEROID - ${id}`,
//                 description:
//                     'Uncommon asteroids represent upgraded mining hubs within the Asteroid collection — offering expanded development capabilities and stronger material yields. Land Build Slots: 4, Orbit Build Slots: 1, Lagrange Space Slots: 1, Sun (Megastructure) Slots: 0, GFMNR Slots: 0, GFORE Slots: 1, AMRITA Slots: 0, TETRA Slots: 0, Specialist Slots: 3. These asteroids balance affordability with improved efficiency for mid-level industrial operations.',
//                 collectionId: '6929971d627f311dcb47bb37',
//                 type: 'asteroid',
//                 rarity: 'uncommon',
//                 coinName: 'usd',
//                 defaultNftPrice: 35,
//                 hexId: 7501,
//             },
//             {
//                 range: 40,

//                 from: 1,
//                 to: 1000,
//                 customPrefixName: (id) => `RARE ASTEROID - ${id} `,
//                 description:
//                     'Rare asteroids stand as elite mining bodies of the Asteroid collection — equipped for advanced industrialization and resource optimization. Land Build Slots: 6, Orbit Build Slots: 1, Lagrange Space Slots: 1, Sun (Megastructure) Slots: 1, GFMNR Slots: 1, GFORE Slots: 1, AMRITA Slots: 0, TETRA Slots: 0, Specialist Slots: 3. Rare asteroids deliver the highest yield potential, making them essential for late-stage extraction and orbital construction networks.',
//                 collectionId: '6929971d627f311dcb47bb37',
//                 type: 'asteroid',
//                 rarity: 'rare',
//                 coinName: 'usd',
//                 defaultNftPrice: 48,
//                 hexId: 9001,
//             },
//         ];

//         for (let z = 0; z < bodyPayload.length; z++) {
//             let {
//                 range,
//                 customPrefixName,
//                 from,
//                 to,
//                 description,
//                 collectionId,
//                 type,
//                 rarity,
//                 coinName,
//                 defaultNftPrice,
//                 // hexId,
//                 wrapRange,
//             } = bodyPayload[z];

//             const landslot = constants.SLOTS[type][rarity];
//             const insertArray = [];
//             let fromNumber = from;
//             let toNumber = to;
//             for (let i = fromNumber; i <= toNumber; i++) {
//                 // const imageKey = `galfi_planet/image/original/${type}/${rarity}/${warpRange(
//                 //     i,
//                 //     wrapRange.from,
//                 //     wrapRange.to,
//                 // )}.png`;

//                 const imageKey = `galfi_planet/image/original/${type}/${rarity}/${i}.png`;
//                 let payload = {
//                     name: customPrefixName(i),
//                     description: description,
//                     image: imageKey,
//                     collectionId: collectionId,
//                     image_url: imageKey,
//                     type: type,
//                     rarity: rarity,
//                     price: defaultNftPrice,
//                     coinName: coinName,
//                     slots: landslot,
//                     hexId: hexId++,
//                 };

//                 insertArray.push(payload);
//             }

//             console.log("insertArray", insertArray);
//             const create = await gameservice.planetInsertMany(insertArray);
//             console.log("create", create)
//         }

//         sendRes(res, 201, true, 'Planet  and asteroid created at a streach  successfully');
//     } catch (error) {
//         sendRes(res, 500, false, error.message, {});
//     }
// };


export const autoEntryPlantorAstroid = async (req, res) => {
    try {

        let hexId = 1;

        const bodyPayload = [
            {
                range: 40,
                from: 1,
                to: 1000,
                customPrefixName: (id) => `RARE PLANET - ${String(id).padStart(3, '0')}`,
                description:
                    'Rare planets represent the premium tier of the 5K collection — designed for advanced expansion, higher efficiency, and superior strategic potential. Land Build Slots: 20, Orbit Build Slots: 3, Lagrange Space Slots: 3, Sun (Megastructure) Slots: 2, GFMNR Slots: 2, GFORE Slots: 2, AMRITA Slots: 1, TETRA Slots: 1, Specialist Slots: 3. Rare planets provide the highest flexibility and resource potential, making them ideal for late-game progression and large-scale construction strategies.',
                collectionId: '667e91d91ea449904060390f',
                type: 'planet',
                rarity: 'rare',
                coinName: 'usd',
                defaultNftPrice: 129,
                hexId: 1,
            },
            {
                range: 60,
                from: 1,
                to: 1500,
                customPrefixName: (id) => `UNCOMMON PLANET - ${String(id).padStart(3, '0')}`,
                description:
                    'Uncommon planets introduce greater expansion capabilities and additional resource-building opportunities, offering a more strategic advantage for players. Land Build Slots: 15, Orbit Build Slots: 2, Lagrange Space Slots: 2, Sun (Megastructure) Slots: 1, GFMNR Slots: 1, GFORE Slots: 1, AMRITA Slots: 0, TETRA Slots: 1, Specialist Slots: 3. Uncommon planets allow for a stronger infrastructure, enabling players to scale their resource operations faster and build more complex systems.',
                collectionId: '667e91d91ea449904060390f',
                type: 'planet',
                rarity: 'uncommon',
                coinName: 'usd',
                defaultNftPrice: 99,
                hexId: 1001,
            },

            {
                range: 100,
                from: 1,
                to: 2500,
                customPrefixName: (id) => `COMMON PLANET - ${String(id).padStart(3, '0')}`,
                description:
                    'Common planets are the foundational tier of the 5K planet collection. Each Common planet offers balanced opportunities for early-stage development and resource generation. Land Build Slots: 10, Orbit Build Slots: 1, Lagrange Space Slots: 1, Sun (Megastructure) Slots: 1, GFMNR Slots: 1, GFORE Slots: 1, AMRITA Slots: 0, TETRA Slots: 0, Specialist Slots: 3. Common planets serve as great starting points for players to begin constructing resource facilities and experimenting with planetary management.',
                collectionId: '667e91d91ea449904060390f',
                type: 'planet',
                rarity: 'common',
                coinName: 'usd',
                defaultNftPrice: 78,
                hexId: 2501,
            },

            {
                range: 100,

                from: 1,
                to: 2500,
                customPrefixName: (id) => `COMMON ASTEROID - ${String(id).padStart(3, '0')}`,
                description:
                    'Common asteroids are entry-level mining bodies in the Asteroid collection — perfect for foundational resource extraction and basic orbital operations. Land Build Slots: 2, Orbit Build Slots: 1, Lagrange Space Slots: 1, Sun (Megastructure) Slots: 0, GFMNR Slots: 0, GFORE Slots: 1, AMRITA Slots: 0, TETRA Slots: 0, Specialist Slots: 3. Common asteroids are cost-effective starting points for resource gathering and early trade setups.',
                collectionId: '6929971d627f311dcb47bb37',
                type: 'asteroid',
                rarity: 'common',
                coinName: 'usd',
                defaultNftPrice: 19,
                hexId: 5001,
            },
            {
                range: 60,
                from: 1,
                to: 1500,
                customPrefixName: (id) => `UNCOMMON ASTEROID - ${String(id).padStart(3, '0')}`,
                description:
                    'Uncommon asteroids represent upgraded mining hubs within the Asteroid collection — offering expanded development capabilities and stronger material yields. Land Build Slots: 4, Orbit Build Slots: 1, Lagrange Space Slots: 1, Sun (Megastructure) Slots: 0, GFMNR Slots: 0, GFORE Slots: 1, AMRITA Slots: 0, TETRA Slots: 0, Specialist Slots: 3. These asteroids balance affordability with improved efficiency for mid-level industrial operations.',
                collectionId: '6929971d627f311dcb47bb37',
                type: 'asteroid',
                rarity: 'uncommon',
                coinName: 'usd',
                defaultNftPrice: 35,
                hexId: 7501,
            },
            {
                range: 40,

                from: 1,
                to: 1000,
                customPrefixName: (id) => `RARE ASTEROID - ${String(id).padStart(3, '0')}`,
                description:
                    'Rare asteroids stand as elite mining bodies of the Asteroid collection — equipped for advanced industrialization and resource optimization. Land Build Slots: 6, Orbit Build Slots: 1, Lagrange Space Slots: 1, Sun (Megastructure) Slots: 1, GFMNR Slots: 1, GFORE Slots: 1, AMRITA Slots: 0, TETRA Slots: 0, Specialist Slots: 3. Rare asteroids deliver the highest yield potential, making them essential for late-stage extraction and orbital construction networks.',
                collectionId: '6929971d627f311dcb47bb37',
                type: 'asteroid',
                rarity: 'rare',
                coinName: 'usd',
                defaultNftPrice: 48,
                hexId: 9001,
            },
        ];

        for (let z = 0; z < bodyPayload.length; z++) {

            let {
                customPrefixName,
                from,
                to,
                description,
                collectionId,
                type,
                rarity,
                coinName,
                defaultNftPrice
            } = bodyPayload[z];

            const landslot = constants.SLOTS[type][rarity];

            const insertArray = [];

            for (let i = from; i <= to; i++) {

                const imageKey = `galfi_planet/image/original/${type}/${rarity}/${i}.png`;

                insertArray.push({
                    name: customPrefixName(i),
                    description,
                    image: imageKey,
                    image_url: imageKey,
                    collectionId,
                    type,
                    rarity,
                    price: defaultNftPrice,
                    coinName,
                    slots: landslot,
                    hexId: hexId++
                });
            }

            /* -------------------------------- */
            /* Check existing hexIds */
            /* -------------------------------- */

            const hexIds = insertArray.map(p => p.hexId);

            const existing = await planetdb
                .find({ hexId: { $in: hexIds } })
                .select("hexId");

            const existingSet = new Set(existing.map(e => e.hexId));

            /* -------------------------------- */
            /* Filter new records */
            /* -------------------------------- */

            const filteredInsert = insertArray.filter(
                p => !existingSet.has(p.hexId)
            );

            /* -------------------------------- */
            /* Insert only new records */
            /* -------------------------------- */

            console.log(`Processing ${type.toUpperCase()} - ${rarity.toUpperCase()}`);

            if (filteredInsert.length > 0) {
                await planetdb.insertMany(filteredInsert);

                console.log(
                    `Inserted ${filteredInsert.length} ${type} (${rarity}) records. Hex Range: ${filteredInsert[0].hexId} - ${filteredInsert[filteredInsert.length - 1].hexId}`
                );

                // Fetch all existing nearby planets for this batch
                const existingNearby = await nearByPlanetSchema.aggregate([
                    {
                        $match: {
                            hexId: {
                                $in: filteredInsert.map(p => p.hexId)
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$hexId",
                            count: { $sum: 1 }
                        }
                    }
                ]);

                const existingMap = new Map(
                    existingNearby.map(item => [item._id, item.count])
                );

                const nearbyPayload = [];

                for (const planet of filteredInsert) {

                    const requiredNearby = config.NEAR_BY_PLANT_COUNT[planet.type]?.[planet.rarity] || 0;

                    const existingCount = existingMap.get(planet.hexId) || 0;

                    const missing = requiredNearby - existingCount;

                    if (missing <= 0) {
                        continue;
                    }

                    for (let i = 0; i < missing; i++) {

                        const planetIDFROMS = getRandomNumber(1, 200);
                        const key = `galfi_planet/image/original/near_by_planet/${planetIDFROMS}.png`;

                        nearbyPayload.push({
                            name: `LP-${String(planet.hexId).padStart(3, "0")}-${String(existingCount + i + 1).padStart(2, "0")}`,
                            description: "",
                            image: key,
                            image_url: key,
                            parentPlanetId: null,
                            acquiredBy: null,
                            hexId: planet.hexId,
                            planetResources: getSurveyMissionResource(),
                        });
                    }

                    // Progress every 100 hexes
                    if (planet.hexId % 100 === 0) {
                        console.log(`Processed till Hex ${planet.hexId}`);
                    }

                }

                if (nearbyPayload.length) {
                    await nearByPlanetSchema.insertMany(nearbyPayload);
                    console.log(
                        `Created ${nearbyPayload.length} nearby planets for Hex Range ${filteredInsert[0].hexId} - ${filteredInsert[filteredInsert.length - 1].hexId}`
                    );

                }
            }


            console.log("Inserted:", filteredInsert.length);
        }

        sendRes(res, 201, true, 'Planet and asteroid created successfully');

    } catch (error) {
        sendRes(res, 500, false, error.message, {});
    }
};


const createNearByPlanet = async (parentPlanetId, hexId, RARE = 'rare', userData) => {
    const payload = [];
    const limit = config.NEAR_BY_PLANT_COUNT.lowest
    for (let i = 0; i < limit; i++) {
        const planetIDFROMS = getRandomNumber(1, 200);
        const key = 'galfi_planet/image/original/near_by_planet/' + planetIDFROMS + '.png';
        const localIndex = String(i + 1).padStart(2, "0");

        payload.push({
            name: `LP-${String(hexId).padStart(3, "0")}-${localIndex}`,
            description: '',
            image: key,
            image_url: key,
            parentPlanetId: null,
            acquiredBy: null,
            hexId: hexId,
            planetResources: getSurveyMissionResource(),
        });
    }

    await nearByPlanetSchema.insertMany(payload);
};

// batch helper
const batchProcess = async (start, end, batchSize = 100) => {
    for (let i = start; i <= end; i += batchSize) {
        const batch = [];
        const batchEnd = Math.min(i + batchSize - 1, end);

        for (let j = i; j <= batchEnd; j++) {
            batch.push(createNearByPlanet(null, j));
        }

        await Promise.all(batch); // run the batch in parallel
        console.log(`Processed hexes ${i} to ${batchEnd}`);
    }
};

export const createNearByPlanetForAllHex = async (req, res) => {
    try {
        await batchProcess(1, 50000, 100); // 100 parallel requests at a time
        res.status(200).json({ message: 'near by planet created for all hex' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating near by planets' });
    }
};

export const autoCrewInsert = async (req, res) => {
    let {
        body: {
            NFTProperties,
            price,
            nftPrice,
            gender,
            collectionId,
            profession,
            from,
            to,
            rarity,
        },
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

// updated oct 24 2025
function pad(num) {
    return num.toString().padStart(3, '0');
}

// total = 10000 = 5000 + 5000
// 1 , 3 , 5 , 7 --- name , image name male
// 2 , 4 , 6 , 8 .... name , image name  female

export const CrewInsert = async (req, res) => {
    try {
        const CREW_DATA = {
            NFTProperties: [],
            gender: 'female',
            collectionId: null,
            profession: 'crew',
            canBuylimit: 0,
            rarity: null,
            nftPrice: 0,
        };

        //! need to change the range
        const warpRange = (n, start, end) => {
            const size = end - start + 1;
            return start + ((n - 1) % size);
        };

        const COLLECTIONID = config.COLLECTION_CONTRACT_DETAILS.crew.collectionID;
        const insertArray = [];
        const baseName = 'crew';
        const imgaepath = CREW_DATA.profession?.toLowerCase().replace(' ', '_');
        let nameCounter = 1;
        for (let j = 1; j <= 5000; j++) {
            let num_conversion = pad(nameCounter);
            const payload = {
                name: `${baseName} #${num_conversion}`,
                crewType: CREW_DATA.profession?.toLowerCase().replace(' ', '_'),
                rarity: CREW_DATA.rarity?.toLowerCase(),
                // image_url: `crew/original/${baseName}/${'male'}/${i}.png`,
                // image: `crew/original/${baseName}/${'male'}/${i}.png`,
                image_url: `${baseName}/original/${baseName}/${'male'}/${nameCounter}.png`,
                image: `${baseName}/original/${baseName}/${'male'}/${nameCounter}.png`,
                nftPrice: 0,
                gender: 'male',
                collection: COLLECTIONID,
                profession: CREW_DATA.profession?.toLowerCase().replace(' ', '_'),
                NFTProperties: CREW_DATA.NFTProperties,
            };
            insertArray.push(payload);
            nameCounter = nameCounter + 1;
            num_conversion = pad(nameCounter);

            const payloadgirl = {
                name: `${baseName} #${num_conversion}`,
                crewType: CREW_DATA.profession?.toLowerCase().replace(' ', '_'),
                rarity: CREW_DATA.rarity?.toLowerCase(),
                image_url: `${baseName}/original/${baseName}/${'female'}/${nameCounter}.png`,
                image: `${baseName}/original/${baseName}/${'female'}/${nameCounter}.png`,
                nftPrice: 0,
                gender: 'female',
                collection: COLLECTIONID,
                profession: CREW_DATA.profession?.toLowerCase().replace(' ', '_'),
                NFTProperties: CREW_DATA.NFTProperties,
            };
            insertArray.push(payloadgirl);
            nameCounter = nameCounter + 1;
            // nameCounter = nameCounter + 2; // because m1 f2 m3 f4 m5 f6

        }

        const create = await gameservice.CrewDataInsertMany(insertArray);
        sendRes(res, 201, true, 'crew inserted successfully', create);
    } catch (error) {
        sendRes(res, 500, false, error.message, {});
    }
};


export const SpecialCrewInsert1 = async (obj) => {
    const { data, constraints } = obj;
    const COLLECTIONID = '';
    if (COLLECTIONID === '') {
        return;
    }
    const insertArray = [];
    let start = 1;
    let rarityArray = [
        { rarity: 'common', count: constraints.common / 2, price: constraints.commonPrice },
        { rarity: 'uncommon', count: constraints.unCommon / 2, price: constraints.uncommonPrice },
        { rarity: 'rare', count: constraints.rare / 2, price: constraints.rarePrice },
    ];
    let getMaleCrew, getFemaleCrew;
    const arrangePayload = (gender, rarity, price) => {
        let num_conversion = pad(start); //1,2
        let insertNFTMale = [
            ...data.NFTProperties.map((prop) => ({
                ...prop,
                value: prop.value || '',
            })),
            { trait_type: 'rarity', value: rarity }, //common
            { trait_type: 'gender', value: gender }, //male,female
        ];
        let baseName = `special_crew/original/${constraints.BaseImageName}/${gender}/${rarity}`; //[male,female]common
        const payload = {
            name: `${data.name} #${num_conversion}`,
            crewType: data.profession?.toLowerCase().replace(' ', '_'),
            rarity: rarity,
            image_url: `crew/${baseName}/${constraints.BaseImageName + '_' + pad(start) + '_' + constraints.Version
                }.png`,
            description: data.description,
            image: `crew/${baseName}/${constraints.BaseImageName + '_' + pad(start) + '_' + constraints.Version
                }.png`,
            price: price,
            gender: gender,
            collection: COLLECTIONID,
            profession: data.profession?.toLowerCase().replace(' ', '_'),
            NFTProperties: insertNFTMale,
            isAssignable: data?.isAssignable,
            isPassive: data?.isPassive,
            bonus: data?.bonus,
        };
        return payload;
    };

    for (let { rarity, count, price } of rarityArray) {
        //[common,120,0]
        for (let i = 0; i < count; i++) {
            getMaleCrew = arrangePayload('male', rarity, price);
            insertArray.push(getMaleCrew);
            start = start + 1; //2,4
            getFemaleCrew = arrangePayload('female', rarity, price);
            insertArray.push(getFemaleCrew);
            start = start + 1; //3,5
        }
    }

    const create = await gameservice.CrewDataInsertMany(insertArray);
    return create;
};

export const SpecialCrewInsert = async (req, res) => {
    try {
        let resultArray = [];
        let total = 0;
        for (let i = 0; i <= CREW_DATA.length - 1; i++) {
            let result = await createSpecialNFT(CREW_DATA[i]);
            total = total + result.length;
            console.log('result', result, total);

            resultArray.push(result);
        }

        console.log('total', total);
        sendRes(res, 201, true, 'crew inserted successfully', resultArray);
    } catch (err) {
        console.log("SpecialCrewInsert_err", err)
        sendRes(res, 500, false, err.message, {});
    }
};

export const createSpecialNFT = async (obj) => {
    const { data, constraints } = obj;
    const COLLECTIONID = config.COLLECTION_CONTRACT_DETAILS.specialcrew.collectionID;
    const insertArray = [];
    let start = 1;
    let common_counter = 1;
    let uncommon_counter = 1;
    let rare_counter = 1;
    for (let i = 0; i < constraints.common / 2; i++) {
        let rarity = 'common';
        let num_conversion = pad(start);
        let insertNFTMale = [
            ...data.NFTProperties.map((prop) => ({
                ...prop,
                value: prop.value || '',
            })),
            { trait_type: 'rarity', value: rarity },
            { trait_type: 'gender', value: 'male' },
        ];
        console.log('insertNFT after push', insertNFTMale);
        let baseName = `special_crew/original/${constraints.BaseImageName.toLowerCase()}/male/${rarity}/`;
        let final_image_path = baseName + `${rarity + "_" + common_counter}.png`
        const payload = {
            name: `${data.name} #${num_conversion}`,
            crewType: data.profession?.toLowerCase().replace(' ', '_'),
            rarity: rarity,
            image_url: final_image_path,
            image: final_image_path,
            description: data.description,
            nftPrice: data.nftPrice,
            gender: 'male',
            collection: COLLECTIONID,
            profession: data.profession?.toLowerCase().replace(' ', '_'),
            NFTProperties: insertNFTMale,
            isAssignable: data?.isAssignable,
            isPassive: data?.isPassive,
            bonus: data?.bonus,
        };
        insertArray.push(payload);
        start = start + 1;
        num_conversion = pad(start);
        console.log('insertMale', insertNFTMale);
        let insertNFTFemale = JSON.parse(JSON.stringify(insertNFTMale));
        insertNFTFemale = insertNFTFemale.map((p) =>
            p.trait_type === 'gender' ? { ...p, value: 'female' } : p,
        );
        baseName = `special_crew/original/${constraints.BaseImageName.toLowerCase()}/female/${rarity}/`;
        final_image_path = baseName + `${rarity + "_" + common_counter}.png`
        const payloadgirl = {
            name: `${data.name} #${num_conversion}`,
            crewType: data.profession?.toLowerCase().replace(' ', '_'),
            rarity: rarity,
            image_url: final_image_path,
            description: data.description,
            image: final_image_path,
            // price: constraints?.commonPrice,
            nftPrice: data.nftPrice,
            gender: 'female',
            collection: COLLECTIONID,
            profession: data.profession?.toLowerCase().replace(' ', '_'),
            NFTProperties: insertNFTFemale,
        };
        insertArray.push(payloadgirl);
        start = start + 1;
        common_counter++;
    }

    for (let i = 0; i < constraints.unCommon / 2; i++) {
        let rarity = 'uncommon';
        let num_conversion = pad(start);
        let insertNFTMale = [
            ...data.NFTProperties.map((prop) => ({
                ...prop,
                value: prop.value || '', //profession
            })),
            { trait_type: 'rarity', value: rarity },
            { trait_type: 'gender', value: 'male' },
        ];
        console.log('insertNFT after push', insertNFTMale);
        let baseName = `special_crew/original/${constraints.BaseImageName.toLowerCase()}/male/${rarity}/`;
        let final_image_path = baseName + `${rarity + "_" + uncommon_counter}.png`
        const payload = {
            name: `${data.name} #${num_conversion}`,
            crewType: data.profession?.toLowerCase().replace(' ', '_'),
            rarity: rarity,
            image_url: final_image_path,
            description: data.description,
            image: final_image_path,
            // price: constraints.unCommonPrice,
            nftPrice: data.nftPrice,
            gender: 'male',
            collection: COLLECTIONID,
            profession: data.profession?.toLowerCase().replace(' ', '_'),
            NFTProperties: insertNFTMale,
            isAssignable: data?.isAssignable,
            isPassive: data?.isPassive,
            bonus: data?.bonus,
        };
        insertArray.push(payload);
        start = start + 1;
        num_conversion = pad(start);
        console.log('insertMale', insertNFTMale);
        let insertNFTFemale = JSON.parse(JSON.stringify(insertNFTMale));
        insertNFTFemale = insertNFTFemale.map((p) =>
            p.trait_type === 'gender' ? { ...p, value: 'female' } : p,
        );
        baseName = `special_crew/original/${constraints.BaseImageName.toLowerCase()}/female/${rarity}/`;
        final_image_path = baseName + `${rarity + "_" + uncommon_counter}.png`
        const payloadgirl = {
            name: `${data.name} #${num_conversion}`,
            crewType: data.profession?.toLowerCase().replace(' ', '_'),
            rarity: rarity,
            image_url: final_image_path,
            description: data.description,
            image: final_image_path,
            // price: constraints?.commonPrice,
            nftPrice: data.nftPrice,
            gender: 'female',
            collection: COLLECTIONID,
            profession: data.profession?.toLowerCase().replace(' ', '_'),
            NFTProperties: insertNFTFemale,
        };
        insertArray.push(payloadgirl);
        start = start + 1;
        uncommon_counter++;
    }

    for (let i = 0; i < constraints.rare / 2; i++) {
        let rarity = 'rare';
        let num_conversion = pad(start);
        let insertNFTMale = [
            ...data.NFTProperties.map((prop) => ({
                ...prop,
                value: prop.value || '', //profession
            })),
            { trait_type: 'rarity', value: rarity },
            { trait_type: 'gender', value: 'male' },
        ];
        console.log('insertNFT after push', insertNFTMale);
        let baseName = `special_crew/original/${constraints.BaseImageName.toLowerCase()}/male/${rarity}/`;
        let final_image_path = baseName + `${rarity + "_" + rare_counter}.png`
        const payload = {
            name: `${data.name} #${num_conversion}`,
            crewType: data.profession?.toLowerCase().replace(' ', '_'),
            rarity: rarity,
            image_url: final_image_path,
            description: data.description,
            image: final_image_path,
            // price: constraints.unCommonPrice,
            nftPrice: data.nftPrice,
            gender: 'male',
            collection: COLLECTIONID,
            profession: data.profession?.toLowerCase().replace(' ', '_'),
            NFTProperties: insertNFTMale,
            isAssignable: data?.isAssignable,
            isPassive: data?.isPassive,
            bonus: data?.bonus,
        };
        insertArray.push(payload);
        start = start + 1;
        num_conversion = pad(start);
        console.log('insertMale', insertNFTMale);
        let insertNFTFemale = JSON.parse(JSON.stringify(insertNFTMale));
        insertNFTFemale = insertNFTFemale.map((p) =>
            p.trait_type === 'gender' ? { ...p, value: 'female' } : p,
        );
        baseName = `special_crew/original/${constraints.BaseImageName.toLowerCase()}/female/${rarity}/`;
        final_image_path = baseName + `${rarity + "_" + rare_counter}.png`
        const payloadgirl = {
            name: `${data.name} #${num_conversion}`,
            crewType: data.profession?.toLowerCase().replace(' ', '_'),
            rarity: rarity,
            image_url: final_image_path,
            description: data.description,
            image: final_image_path,
            // price: constraints?.commonPrice,
            nftPrice: data.nftPrice,
            gender: 'female',
            collection: COLLECTIONID,
            profession: data.profession?.toLowerCase().replace(' ', '_'),
            NFTProperties: insertNFTFemale,
        };
        insertArray.push(payloadgirl);
        start = start + 1;
        rare_counter++;
    }

    const create = await gameservice.CrewDataInsertMany(insertArray);
    return create;
};

export const autoInsertShipAssert = async (req, res) => {
    try {
        const SHIPCOLLECTIONID = config.COLLECTION_CONTRACT_DETAILS.ship.collectionID;
        const assetData = SHIP_DATA.map((e) => {
            e.collection = SHIPCOLLECTIONID;
            delete e.updatedAt;
            delete e.createdAt;
            delete e._id;
            delete e.__v;
            return e;
        });
        console.log('assetData', assetData);

        const create = await gameservice.ShipDataInsertMany(assetData);
        sendRes(res, 201, true, 'ship inserted successfully', create);
    } catch (error) {
        sendRes(res, 500, false, error.message, {});
    }
};

export const insertProfessions = async (req, res) => {
    let inserted = 0;
    let updated = 0;

    for (const profession of professions) {
        const normalized = {
            ...profession,
            key: profession.key.trim().toUpperCase(),
            image_male: `/profession/original/male/${profession.key.trim().toUpperCase()}.png`,
            image_female: `/profession/original/female/${profession.key.trim().toUpperCase()}.png`,
        };
        console.log(`🔍 Checking → ${profession.key}`);
        const existing = await Profession.findOne({
            key: normalized.key,
        });

        if (existing) {
            await Profession.updateOne({ key: normalized.key }, { $set: normalized });

            console.log(`🔄 Updated → ${normalized.key}`);
            updated++;
        } else {
            await Profession.create(normalized);

            console.log(`✅ Inserted → ${normalized.key}`);
            inserted++;
        }
    }

    console.log('\n📊 Summary');
    console.log('-----------------------');
    console.log(`Inserted : ${inserted}`);
    console.log(`Updated  : ${updated}`);
    res.send({
        Inserted: inserted,
        Updated: updated,
    });
};

export const mission_reward_db_entry = async (req, res) => {
    try {
        const {
            body: { password },
        } = req;

        if (password != 'GFCAP') {
            sendRes(res, 409, false, `password miss match`);
            return;
        }
        const missinreward = [
            {
                rewardNumber: 1,
                mining: [
                    { label: 'GFORE', amount: 1 },
                    { label: 'GFMNR', amount: 1 },
                ],
                explore: [{ label: 'GFAAC', amount: 0.5 }],
                combat: [{ label: 'XENOS', amount: 0.5 }],
                social: [
                    { label: 'GALFI', amount: 0.25 },
                    { label: 'GFEXO', amount: 0.5 },
                ],
            },
            {
                rewardNumber: 2,
                mining: [
                    { label: 'GFORE', amount: 1 },
                    { label: 'GFMNR', amount: 1 },
                ],
                explore: [{ label: 'GFAAC', amount: 0.5 }],
                combat: [{ label: 'XENOS', amount: 0.5 }],
                social: [
                    { label: 'GALFI', amount: 0.25 },
                    { label: 'GFEXO', amount: 0.5 },
                ],
            },
            {
                rewardNumber: 3,
                mining: [
                    { label: 'GFORE', amount: 1 },
                    { label: 'GFMNR', amount: 1 },
                ],
                explore: [{ label: 'GFAAC', amount: 0.5 }],
                combat: [{ label: 'XENOS', amount: 0.5 }],
                social: [
                    { label: 'GALFI', amount: 0.25 },
                    { label: 'GFEXO', amount: 0.5 },
                ],
            },
            {
                rewardNumber: 4,
                mining: [
                    { label: 'GFORE', amount: 1 },
                    { label: 'GFMNR', amount: 1 },
                    { label: 'AMRITA', amount: 1 },
                ],
                explore: [{ label: 'GFAAC', amount: 0.5 }],
                combat: [{ label: 'XENOS', amount: 0.5 }],
                social: [
                    { label: 'GALFI', amount: 0.25 },
                    { label: 'GFEXO', amount: 0.5 },
                ],
            },
            {
                rewardNumber: 5,
                mining: [
                    { label: 'GFORE', amount: 1 },
                    { label: 'GFMNR', amount: 1 },
                ],
                explore: [{ label: 'GFAAC', amount: 0.5 }],
                combat: [{ label: 'XENOS', amount: 0.5 }],
                social: [
                    { label: 'GALFI', amount: 0.25 },
                    { label: 'GFEXO', amount: 0.5 },
                ],
            },
            {
                rewardNumber: 6,
                mining: [
                    { label: 'GFORE', amount: 2 },
                    { label: 'GFMNR', amount: 2 },
                    { label: 'TETRA', amount: 1 },
                ],
                explore: [
                    { label: 'GFAAC', amount: 1 },
                    { label: 'GFAAR', amount: 1 },
                ],
                combat: [
                    { label: 'XENOS', amount: 1 },
                    { label: 'GFAAC', amount: 0.5 },
                ],
                social: [
                    { label: 'GALFI', amount: 0.25 },
                    { label: 'GFEXO', amount: 0.5 },
                ],
            },
            {
                rewardNumber: 7,
                mining: [
                    { label: 'GFORE', amount: 2 },
                    { label: 'GFMNR', amount: 2 },
                ],
                explore: [{ label: 'GFAAC', amount: 1 }],
                combat: [{ label: 'XENOS', amount: 1 }],
                social: [
                    { label: 'GALFI', amount: 0.5 },
                    { label: 'GFEXO', amount: 1 },
                ],
            },
            {
                rewardNumber: 8,
                mining: [
                    { label: 'GFORE', amount: 2 },
                    { label: 'GFMNR', amount: 2 },
                ],
                explore: [{ label: 'GFAAC', amount: 1 }],
                combat: [{ label: 'XENOS', amount: 1 }],
                social: [
                    { label: 'GALFI', amount: 0.5 },
                    { label: 'GFEXO', amount: 1 },
                ],
            },
            {
                rewardNumber: 9,
                mining: [
                    { label: 'GFORE', amount: 2 },
                    { label: 'GFMNR', amount: 2 },
                ],
                explore: [{ label: 'GFAAC', amount: 1 }],
                combat: [{ label: 'XENOS', amount: 1 }],
                social: [
                    { label: 'GALFI', amount: 0.5 },
                    { label: 'GFEXO', amount: 1 },
                ],
            },
            {
                rewardNumber: 10,
                mining: [
                    { label: 'GFORE', amount: 2 },
                    { label: 'GFMNR', amount: 2 },
                ],
                explore: [{ label: 'GFAAC', amount: 1 }],
                combat: [{ label: 'XENOS', amount: 1 }],
                social: [
                    { label: 'GALFI', amount: 0.5 },
                    { label: 'GFEXO', amount: 1 },
                ],
            },
            {
                rewardNumber: 11,
                mining: [
                    { label: 'GFORE', amount: 2 },
                    { label: 'GFMNR', amount: 2 },
                ],
                explore: [{ label: 'GFAAC', amount: 1 }],
                combat: [{ label: 'XENOS', amount: 1 }],
                social: [
                    { label: 'GALFI', amount: 0.5 },
                    { label: 'GFEXO', amount: 1 },
                ],
            },
            {
                rewardNumber: 12,
                mining: [
                    { label: 'GFORE', amount: 3 },
                    { label: 'GFMNR', amount: 3 },
                    { label: 'TETRA', amount: 2 },
                ],
                explore: [
                    { label: 'GFAAC', amount: 1.5 },
                    { label: 'GFAAR', amount: 1 },
                ],
                combat: [
                    { label: 'XENOS', amount: 1.5 },
                    { label: 'GFAAC', amount: 1 },
                ],
                social: [
                    { label: 'GALFI', amount: 0.75 },
                    { label: 'GFEXO', amount: 1.5 },
                ],
            },
            {
                rewardNumber: 13,
                mining: [
                    { label: 'GFORE', amount: 3 },
                    { label: 'GFMNR', amount: 3 },
                ],
                explore: [{ label: 'GFAAC', amount: 1.5 }],
                combat: [{ label: 'XENOS', amount: 1.5 }],
                social: [
                    { label: 'GALFI', amount: 0.75 },
                    { label: 'GFEXO', amount: 1.5 },
                ],
            },
            {
                rewardNumber: 14,
                mining: [
                    { label: 'GFORE', amount: 3 },
                    { label: 'GFMNR', amount: 3 },
                ],
                explore: [{ label: 'GFAAC', amount: 1.5 }],
                combat: [{ label: 'XENOS', amount: 1.5 }],
                social: [
                    { label: 'GALFI', amount: 0.75 },
                    { label: 'GFEXO', amount: 1.5 },
                ],
            },
            {
                rewardNumber: 15,
                mining: [
                    { label: 'GFORE', amount: 3 },
                    { label: 'GFMNR', amount: 3 },
                    { label: 'AMRITA', amount: 1 },
                ],
                explore: [{ label: 'GFAAC', amount: 1.5 }],
                combat: [{ label: 'XENOS', amount: 1.5 }],
                social: [
                    { label: 'GALFI', amount: 0.75 },
                    { label: 'GFEXO', amount: 1.5 },
                ],
            },
            {
                rewardNumber: 16,
                mining: [
                    { label: 'GFORE', amount: 3 },
                    { label: 'GFMNR', amount: 3 },
                ],
                explore: [{ label: 'GFAAC', amount: 1.5 }],
                combat: [{ label: 'XENOS', amount: 1.5 }],
                social: [
                    { label: 'GALFI', amount: 0.75 },
                    { label: 'GFEXO', amount: 1.5 },
                ],
            },
            {
                rewardNumber: 17,
                mining: [
                    { label: 'GFORE', amount: 3 },
                    { label: 'GFMNR', amount: 3 },
                ],
                explore: [{ label: 'GFAAC', amount: 1.5 }],
                combat: [{ label: 'XENOS', amount: 1.5 }],
                social: [
                    { label: 'GALFI', amount: 0.75 },
                    { label: 'GFEXO', amount: 1.5 },
                ],
            },
            {
                rewardNumber: 18,
                mining: [
                    { label: 'GFORE', amount: 4 },
                    { label: 'GFMNR', amount: 4 },
                    { label: 'TETRA', amount: 3 },
                ],
                explore: [
                    { label: 'GFAAC', amount: 2 },
                    { label: 'GFAAR', amount: 1 },
                ],
                combat: [
                    { label: 'XENOS', amount: 2 },
                    { label: 'GFAAC', amount: 1.5 },
                ],
                social: [
                    { label: 'GALFI', amount: 4 },
                    { label: 'GFEXO', amount: 2 },
                ],
            },
            {
                rewardNumber: 19,
                mining: [
                    { label: 'GFORE', amount: 4 },
                    { label: 'GFMNR', amount: 4 },
                ],
                explore: [{ label: 'GFAAC', amount: 2 }],
                combat: [{ label: 'XENOS', amount: 2 }],
                social: [
                    { label: 'GALFI', amount: 1 },
                    { label: 'GFEXO', amount: 2 },
                ],
            },
            {
                rewardNumber: 20,
                mining: [
                    { label: 'GFORE', amount: 4 },
                    { label: 'GFMNR', amount: 4 },
                ],
                explore: [{ label: 'GFAAC', amount: 2 }],
                combat: [{ label: 'XENOS', amount: 2 }],
                social: [
                    { label: 'GALFI', amount: 1 },
                    { label: 'GFEXO', amount: 2 },
                ],
            },
            {
                rewardNumber: 21,
                mining: [
                    { label: 'GFORE', amount: 4 },
                    { label: 'GFMNR', amount: 4 },
                ],
                explore: [{ label: 'GFAAC', amount: 2 }],
                combat: [{ label: 'XENOS', amount: 2 }],
                social: [
                    { label: 'GALFI', amount: 1 },
                    { label: 'GFEXO', amount: 2 },
                ],
            },
            {
                rewardNumber: 22,
                mining: [
                    { label: 'GFORE', amount: 4 },
                    { label: 'GFMNR', amount: 4 },
                ],
                explore: [{ label: 'GFAAC', amount: 2 }],
                combat: [{ label: 'XENOS', amount: 2 }],
                social: [
                    { label: 'GALFI', amount: 1 },
                    { label: 'GFEXO', amount: 2 },
                ],
            },
            {
                rewardNumber: 23,
                mining: [
                    { label: 'GFORE', amount: 4 },
                    { label: 'GFMNR', amount: 4 },
                ],
                explore: [{ label: 'GFAAC', amount: 2 }],
                combat: [{ label: 'XENOS', amount: 2 }],
                social: [
                    { label: 'GALFI', amount: 1 },
                    { label: 'GFEXO', amount: 2 },
                ],
            },
            {
                rewardNumber: 24,
                mining: [
                    { label: 'GFORE', amount: 5 },
                    { label: 'GFMNR', amount: 5 },
                    { label: 'TETRA', amount: 4 },
                ],
                explore: [
                    { label: 'GFAAC', amount: 2.5 },
                    { label: 'GFAAR', amount: 1 },
                ],
                combat: [
                    { label: 'XENOS', amount: 2.5 },
                    { label: 'GFAAC', amount: 2 },
                ],
                social: [
                    { label: 'GALFI', amount: 1.25 },
                    { label: 'GFEXO', amount: 2.25 },
                ],
            },
            {
                rewardNumber: 25,
                mining: [
                    { label: 'GFORE', amount: 5 },
                    { label: 'GFMNR', amount: 5 },
                ],
                explore: [{ label: 'GFAAC', amount: 2.5 }],
                combat: [{ label: 'XENOS', amount: 2.5 }],
                social: [
                    { label: 'GALFI', amount: 1.25 },
                    { label: 'GFEXO', amount: 2.25 },
                ],
            },
            {
                rewardNumber: 26,
                mining: [
                    { label: 'GFORE', amount: 5 },
                    { label: 'GFMNR', amount: 5 },
                ],
                explore: [{ label: 'GFAAC', amount: 2.5 }],
                combat: [{ label: 'XENOS', amount: 2.5 }],
                social: [
                    { label: 'GALFI', amount: 1.25 },
                    { label: 'GFEXO', amount: 2.25 },
                ],
            },
            {
                rewardNumber: 27,
                mining: [
                    { label: 'GFORE', amount: 5 },
                    { label: 'GFMNR', amount: 5 },
                    { label: 'AMRITA', amount: 1 },
                ],
                explore: [{ label: 'GFAAC', amount: 2.5 }],
                combat: [{ label: 'XENOS', amount: 2.5 }],
                social: [
                    { label: 'GALFI', amount: 1.25 },
                    { label: 'GFEXO', amount: 2.25 },
                ],
            },
            {
                rewardNumber: 28,
                mining: [
                    { label: 'GFORE', amount: 5 },
                    { label: 'GFMNR', amount: 5 },
                ],
                explore: [{ label: 'GFAAC', amount: 2.5 }],
                combat: [{ label: 'XENOS', amount: 2.5 }],
                social: [
                    { label: 'GALFI', amount: 1.25 },
                    { label: 'GFEXO', amount: 2.25 },
                ],
            },
            {
                rewardNumber: 29,
                mining: [
                    { label: 'GFORE', amount: 5 },
                    { label: 'GFMNR', amount: 5 },
                ],
                explore: [{ label: 'GFAAC', amount: 2.5 }],
                combat: [{ label: 'XENOS', amount: 2.5 }],
                social: [
                    { label: 'GALFI', amount: 1.25 },
                    { label: 'GFEXO', amount: 2.25 },
                ],
            },
            {
                rewardNumber: 30,
                mining: [
                    { label: 'GFORE', amount: 6 },
                    { label: 'GFMNR', amount: 6 },
                    { label: 'TETRA', amount: 5 },
                ],
                explore: [
                    { label: 'GFAAC', amount: 3 },
                    { label: 'GFAAA', amount: 1 },
                ],
                combat: [
                    { label: 'XENOS', amount: 3 },
                    { label: 'GFAAC', amount: 2.5 },
                ],
                social: [
                    { label: 'GALFI', amount: 1.5 },
                    { label: 'GFEXO', amount: 3 },
                ],
            },
            {
                rewardNumber: 31,
                mining: [
                    { label: 'GFORE', amount: 6 },
                    { label: 'GFMNR', amount: 6 },
                ],
                explore: [{ label: 'GFAAC', amount: 3 }],
                combat: [{ label: 'XENOS', amount: 3 }],
                social: [
                    { label: 'GALFI', amount: 1.5 },
                    { label: 'GFEXO', amount: 3 },
                ],
            },
            {
                rewardNumber: 32,
                mining: [
                    { label: 'GFORE', amount: 6 },
                    { label: 'GFMNR', amount: 6 },
                ],
                explore: [{ label: 'GFAAC', amount: 3 }],
                combat: [{ label: 'XENOS', amount: 3 }],
                social: [
                    { label: 'GALFI', amount: 1.5 },
                    { label: 'GFEXO', amount: 3 },
                ],
            },
            {
                rewardNumber: 33,
                mining: [
                    { label: 'GFORE', amount: 6 },
                    { label: 'GFMNR', amount: 6 },
                    { label: 'GFEXO', amount: 1 },
                ],
                explore: [{ label: 'GFAAC', amount: 3 }],
                combat: [{ label: 'XENOS', amount: 3 }],
                social: [
                    { label: 'GALFI', amount: 1.5 },
                    { label: 'GFEXO', amount: 3 },
                ],
            },
            {
                rewardNumber: 34,
                mining: [
                    { label: 'GFORE', amount: 6 },
                    { label: 'GFMNR', amount: 6 },
                ],
                explore: [{ label: 'GFAAC', amount: 3 }],
                combat: [{ label: 'XENOS', amount: 3 }],
                social: [
                    { label: 'GALFI', amount: 1.5 },
                    { label: 'GFEXO', amount: 3 },
                ],
            },
            {
                rewardNumber: 35,
                mining: [
                    { label: 'GFORE', amount: 6 },
                    { label: 'GFMNR', amount: 6 },
                ],
                explore: [{ label: 'GFAAC', amount: 3 }],
                combat: [{ label: 'XENOS', amount: 3 }],
                social: [
                    { label: 'GALFI', amount: 1.5 },
                    { label: 'GFEXO', amount: 3 },
                ],
            },
            {
                rewardNumber: 36,
                mining: [
                    { label: 'GFORE', amount: 7 },
                    { label: 'GFMNR', amount: 7 },
                    { label: 'TETRA', amount: 6 },
                ],
                explore: [
                    { label: 'GFAAC', amount: 3.5 },
                    { label: 'GFAAA', amount: 1 },
                ],
                combat: [
                    { label: 'XENOS', amount: 3.5 },
                    { label: 'GFAAC', amount: 3 },
                ],
                social: [
                    { label: 'GALFI', amount: 2 },
                    { label: 'GFEXO', amount: 3.5 },
                ],
            },
            {
                rewardNumber: 37,
                mining: [
                    { label: 'GFORE', amount: 7 },
                    { label: 'GFMNR', amount: 7 },
                ],
                explore: [{ label: 'GFAAC', amount: 3.5 }],
                combat: [{ label: 'XENOS', amount: 3.5 }],
                social: [
                    { label: 'GALFI', amount: 2 },
                    { label: 'GFEXO', amount: 3.5 },
                ],
            },
            {
                rewardNumber: 38,
                mining: [
                    { label: 'GFORE', amount: 7 },
                    { label: 'GFMNR', amount: 7 },
                ],
                explore: [{ label: 'GFAAC', amount: 3.5 }],
                combat: [{ label: 'XENOS', amount: 3.5 }],
                social: [
                    { label: 'GALFI', amount: 2 },
                    { label: 'GFEXO', amount: 3.5 },
                ],
            },
            {
                rewardNumber: 39,
                mining: [
                    { label: 'GFORE', amount: 7 },
                    { label: 'GFMNR', amount: 7 },
                    { label: 'AMRITA', amount: 1 },
                ],
                explore: [{ label: 'GFAAC', amount: 3.5 }],
                combat: [{ label: 'XENOS', amount: 3.5 }],
                social: [
                    { label: 'GALFI', amount: 2 },
                    { label: 'GFEXO', amount: 3.5 },
                ],
            },
            {
                rewardNumber: 40,
                mining: [
                    { label: 'GFORE', amount: 7 },
                    { label: 'GFMNR', amount: 7 },
                ],
                explore: [{ label: 'GFAAC', amount: 3.5 }],
                combat: [{ label: 'XENOS', amount: 3.5 }],
                social: [
                    { label: 'GALFI', amount: 2 },
                    { label: 'GFEXO', amount: 3.5 },
                ],
            },
            {
                rewardNumber: 41,
                mining: [
                    { label: 'GFORE', amount: 7 },
                    { label: 'GFMNR', amount: 7 },
                ],
                explore: [{ label: 'GFAAC', amount: 3.5 }],
                combat: [{ label: 'XENOS', amount: 3.5 }],
                social: [
                    { label: 'GALFI', amount: 2 },
                    { label: 'GFEXO', amount: 3.5 },
                ],
            },
            {
                rewardNumber: 42,
                mining: [
                    { label: 'GFORE', amount: 8 },
                    { label: 'GFMNR', amount: 8 },
                    { label: 'TETRA', amount: 7 },
                ],
                explore: [
                    { label: 'GFAAC', amount: 4 },
                    { label: 'GFAAA', amount: 1 },
                ],
                combat: [
                    { label: 'XENOS', amount: 4 },
                    { label: 'GFAAC', amount: 3.5 },
                ],
                social: [
                    { label: 'GALFI', amount: 2.5 },
                    { label: 'GFEXO', amount: 3.5 },
                ],
            },
            {
                rewardNumber: 43,
                mining: [
                    { label: 'GFORE', amount: 8 },
                    { label: 'GFMNR', amount: 8 },
                ],
                explore: [{ label: 'GFAAC', amount: 4 }],
                combat: [{ label: 'XENOS', amount: 4 }],
                social: [
                    { label: 'GALFI', amount: 2.5 },
                    { label: 'GFEXO', amount: 3.5 },
                ],
            },
            {
                rewardNumber: 44,
                mining: [
                    { label: 'GFORE', amount: 8 },
                    { label: 'GFMNR', amount: 8 },
                ],
                explore: [{ label: 'GFAAC', amount: 4 }],
                combat: [{ label: 'XENOS', amount: 4 }],
                social: [
                    { label: 'GALFI', amount: 2.5 },
                    { label: 'GFEXO', amount: 3.5 },
                ],
            },
            {
                rewardNumber: 45,
                mining: [
                    { label: 'GFORE', amount: 8 },
                    { label: 'GFMNR', amount: 8 },
                    { label: 'AMRIT', amount: 1 },
                ],
                explore: [{ label: 'GFAAC', amount: 4 }],
                combat: [{ label: 'XENOS', amount: 3.5 }],
                social: [
                    { label: 'GALFI', amount: 2.5 },
                    { label: 'GFEXO', amount: 3.5 },
                ],
            },
            {
                rewardNumber: 46,
                mining: [
                    { label: 'GFORE', amount: 8 },
                    { label: 'GFMNR', amount: 8 },
                ],
                explore: [{ label: 'GFAAC', amount: 4 }],
                combat: [
                    { label: 'XENOS', amount: 4 },
                    { label: 'GFAAC', amount: 3.5 },
                ],
                social: [
                    { label: 'GALFI', amount: 2.5 },
                    { label: 'GFEXO', amount: 3.5 },
                ],
            },
            {
                rewardNumber: 47,
                mining: [
                    { label: 'GFORE', amount: 8 },
                    { label: 'GFMNR', amount: 8 },
                ],
                explore: [{ label: 'GFAAC', amount: 4 }],
                combat: [{ label: 'XENOS', amount: 4 }],
                social: [
                    { label: 'GALFI', amount: 2.5 },
                    { label: 'GFEXO', amount: 3.5 },
                ],
            },
            {
                rewardNumber: 48,
                mining: [
                    { label: 'GFORE', amount: 9 },
                    { label: 'GFMNR', amount: 9 },
                    { label: 'TETRA', amount: 8 },
                ],
                explore: [{ label: 'GFAAC', amount: 4.5 }],
                combat: [{ label: 'XENOS', amount: 4.5 }],
                social: [
                    { label: 'GALFI', amount: 4 },
                    { label: 'GFEXO', amount: 4.5 },
                ],
            },
            {
                rewardNumber: 49,
                mining: [
                    { label: 'GFORE', amount: 9 },
                    { label: 'GFMNR', amount: 9 },
                ],
                explore: [{ label: 'GFAAC', amount: 4.5 }],
                combat: [
                    { label: 'XENOS', amount: 5 },
                    { label: 'GFAAA', amount: 1 },
                ],
                social: [
                    { label: 'GALFI', amount: 5 },
                    { label: 'GFEXO', amount: 4.5 },
                ],
            },
            {
                rewardNumber: 50,
                mining: [
                    { label: 'GFORE', amount: 10 },
                    { label: 'GFMNR', amount: 10 },
                    { label: 'TETRA', amount: 10 },
                    { label: 'AMRIT', amount: 2 },
                ],
                explore: [{ label: 'GFAAC', amount: 5 }],
                combat: [
                    { label: 'GFEXO', amount: 1.5 },
                    { label: 'GALFI', amount: 3 },
                ],
                social: [
                    { label: 'GALFI', amount: 6 },
                    { label: 'GFEXO', amount: 4.5 },
                ],
            },
        ];
        let data = await InsertManyMissionReward(missinreward);
        res.status(201).json(data);
    } catch (e) {
        res.status(500).send(e.message);
    }
};

export const changeCurrencyContractAddrss = async (req, res) => {
    try {
        const {
            body: { type, password },
        } = req;
        if (password != 'GFCAP') {
            return sendRes(res, 409, false, `password miss match`);
        }
        const updateReward = [];
        const oldConractObject = [
            { label: 'GFMNR', address: '0x4224ae0b79c7c35ce57f435bc145acf2d0e5d405' },
            { label: 'GFORE', address: '0x9799a876ae2929c47e3f65cb3769d3098ec82066' },
            { label: 'HYPER', address: '0xbdcf5110997d2676c92cb4fea929d25992cc9606' },
            { label: 'AMRIT', address: '0x4f69ee55087197c9f2d790829186036e37771061' },
            { label: 'TETRA', address: '0x984a428950a6bf74e822c9e58bb072115d326428' },
            { label: 'GFRCE', address: '0xcea1aff2dcf944609f0b4af9783d4e1d30e5200f' },
            { label: 'GFOOD', address: '0x66a480569ea6c11d24b8125a5954b554a5829d32' },
            { label: 'XENOS', address: '0xdf2dd3125f92c3a4c9c3b116b63a90f1757a385e' },
            { label: 'GFCMP', address: '0xedace6bd1f69230e6eb03c882aa55b33062d1ea0' },
            { label: 'GFNRG', address: '0x7382e3dcd1116ee8d6372a7b66a077ed9b281d9f' },
            { label: 'GFEXO', address: '0x5645ffce43b480bdda8ed57288a09e96d098d618' },
            { label: 'GFAAC', address: '0x7b02c2e800a1d125483988963366522bf87a927e' },
            { label: 'GFAAA', address: '0xacfe811ff3dd651993c7ebd6b7f9623ba0cc62cc' },
            { label: 'GFAAR', address: '0xec43a1d13e5516f2a8223051cbd889fcb0b53c3d' },
            { label: 'GALFI', address: '0x11bfe96d08c5048975f6bd60da59354ea1e85add' },
        ];

        const newObject = [
            { label: 'GFMNR', address: '0xee83976479943941baa198225854d6f2290b9e3c' },
            { label: 'GFORE', address: '0x03cafc1ec7506123255aebb5e0ba3958cca80401' },
            { label: 'HYPER', address: '0x86962528a1dcc97d524e2c1a67244504a0af28a8' },
            { label: 'AMRIT', address: '0x110110fce91ce0e98184eba93ff0c83655f0b503' },
            { label: 'TETRA', address: '0x21c49eacb77e3c73418b005d6dcdf571eedcd988' },
            { label: 'GFRCE', address: '0xc369712529f300a9517e0de44826d327a8f8315b' },
            { label: 'GFOOD', address: '0x878a4f7a168d15c5fe594cf015994738fafada79' },
            { label: 'XENOS', address: '0x1f70e945b6dda0ebd651e8f6bd709376ebf7ef4f' },
            { label: 'GFCMP', address: '0x7db8da145583a2d516dfc6b1a0083b40d832464b' },
            { label: 'GFNRG', address: '0x7fd52ee6c2ba39eb5acecd857eeda71e7db6790c' },
            { label: 'GFEXO', address: '0x2d8a3c5b01e80f3e2215b32f1a5fa807607baedb' },
            { label: 'GFAAC', address: '0x74fde1ea7096381e451756ae4d03807ebae2b88e' },
            { label: 'GFAAA', address: '0x3c36a8cc56b7eb784659a0a46ec399d2bc20fdf7' },
            { label: 'GFAAR', address: '0xccbf1a34a95efe4cca72eb3aa6034b1ad305e7e4' },
            { label: 'GALFI', address: '0xf6d1c081e149123288d8b483da0058b631f9483c' },
        ];

        if (type === 'new') {
            for (let i = 0; i < newObject.length; i++) {
                const oContact = newObject[i].label;
                const nContact = newObject[i].address;
                updateReward.push({
                    updateOne: {
                        filter: { label: oContact },
                        update: {
                            $set: { address: nContact },
                        },
                    },
                });
            }
        }

        if (type === 'old') {
            for (let i = 0; i < oldConractObject.length; i++) {
                const oContact = oldConractObject[i].label;
                const nContact = oldConractObject[i].address;

                updateReward.push({
                    updateOne: {
                        filter: { label: oContact },
                        update: {
                            $set: { address: nContact },
                        },
                    },
                });
            }
        }

        const x = await currencyBulkWrite(updateReward);
        sendRes(res, 200, true, `updated successfully `, x);
    } catch (e) {
        sendRes(res, 500, false, `failed`, e.message);
    }
};

export const assignCrewToPlanets = async (req, res) => {
    try {
        /* Fetch planets & crew */

        const planets = await planetdb.find().sort({ hexId: 1 });
        const crews = await crewdb.find({ crewType: "crew" });

        if (!planets.length || !crews.length) {
            return sendRes(res, 400, false, "No planets or crews found");
        }

        /* Check availability */

        if (crews.length < planets.length) {
            return sendRes(
                res,
                400,
                false,
                `Not enough crew. Required: ${planets.length}, Available: ${crews.length}`
            );
        }

        /* Assign crew */

        const bulkOps = [];

        for (let i = 0; i < planets.length; i++) {
            const planet = planets[i];
            const crew = crews[i];

            bulkOps.push({
                updateOne: {
                    filter: { _id: planet._id },
                    update: {
                        $set: {
                            crewId: crew._id
                        }
                    }
                }
            });
        }

        /* Bulk update */

        if (bulkOps.length > 0) {
            await planetdb.bulkWrite(bulkOps);
        }

        sendRes(res, 200, true, "Crew assigned to planets successfully");

    } catch (error) {
        sendRes(res, 500, false, error.message);
    }
};
const { sendRes } = require('../../shared/commonFunction');
const {
    createProfession,
    getAllProfessions,
    getProfessionById,
    getProfessionByKey,
    updateProfessionById,
    deactivateProfession,
} = require('./profession.service');

const { createProfessionSchema, updateProfessionSchema } = require('./profession.validation');
import crewdb from "../game/schema/crew.schema"
import professionSchema from "./profession.schema";

/* -------------------------------------------------- */
/* CREATE */
/* -------------------------------------------------- */

const create = async (req, res) => {
    try {
        const payload = await createProfessionSchema.validate(req.body);

        const profession = await createProfession(payload);

        res.status(201).json({
            success: true,
            data: profession,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

/* -------------------------------------------------- */
/* GET ALL */
/* -------------------------------------------------- */

const getAllProfession = async (req, res) => {
    try {
        const professions = await getAllProfessions({
            isActive: true,
        });
        console.log("professions", professions)

        // const crewCounts = await crewdb.aggregate([
        //     {
        //         $match: { isActive: true }
        //     },
        //     {
        //         $group: {
        //             _id: { $toLower: "$profession" },
        //             gender: { $toLower: "$gender" },
        //             leftCount: { $sum: 1 }
        //         }
        //     }
        // ]);
        // const countMap = {};
        // crewCounts.forEach(c => {
        //     countMap[c._id] = c.leftCount;
        // });

        const crewCounts = await crewdb.aggregate([
            {
                $match: {
                    isActive: true
                }
            },
            {
                $group: {
                    _id: { $toLower: "$profession" },
                    leftCount: { $sum: 1 },
                    maleLeftCount: {
                        $sum: {
                            $cond: [
                                { $eq: [{ $toLower: "$gender" }, "male"] },
                                1,
                                0
                            ]
                        }
                    },
                    femaleLeftCount: {
                        $sum: {
                            $cond: [
                                { $eq: [{ $toLower: "$gender" }, "female"] },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const countMap = {};

        crewCounts.forEach(c => {
            countMap[c._id] = {
                leftCount: c.leftCount,
                maleLeftCount: c.maleLeftCount,
                femaleLeftCount: c.femaleLeftCount
            };
        });

        const result = professions.map(p => {
            console.log("profData", p)
            const key = (p.key || "").toLowerCase();

            const counts = countMap[key] || {
                leftCount: 0,
                maleLeftCount: 0,
                femaleLeftCount: 0
            };

            return {
                _id: p._id,
                key: key,
                image_male: p.image_male,
                image_female: p.image_female,
                nftCost: p.nftCost,
                baseContribution: p.baseContribution,
                isActive: p.isActive,
                leftCount: counts.leftCount,
                maleLeftCount: counts.maleLeftCount,
                femaleLeftCount: counts.femaleLeftCount
            };
        });

        sendRes(res, 200, true, 'Fetched the profession', result)

    } catch (err) {
        console.log("getAllProfession", err)
        sendRes(res, 500, false, err.message)
    }
};



/* -------------------------------------------------- */
/* GET BY ID */
/* -------------------------------------------------- */

const getById = async (req, res) => {
    try {
        const profession = await getProfessionById(req.params.id);

        if (!profession) {
            return res.status(404).json({
                success: false,
                message: 'Profession not found',
            });
        }

        res.json({
            success: true,
            data: profession,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

/* -------------------------------------------------- */
/* GET BY KEY (VERY IMPORTANT FOR GAME ENGINE) */
/* -------------------------------------------------- */

const getByKey = async (req, res) => {
    try {
        const profession = await getProfessionByKey(req.params.key);

        if (!profession) {
            return res.status(404).json({
                success: false,
                message: 'Profession not found',
            });
        }

        res.json({
            success: true,
            data: profession,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

/* -------------------------------------------------- */
/* UPDATE */
/* -------------------------------------------------- */

const update = async (req, res) => {
    try {
        const payload = await updateProfessionSchema.validate(req.body);

        const profession = await updateProfessionById(req.params.id, payload);

        res.json({
            success: true,
            data: profession,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

const updateNFTCost = async (req, res) => {
    try {
        const { nftCost } = req.body;

        // validate nftCost exists
        if (nftCost === undefined) {
            sendRes(res, 400, false, 'nftCost is required')
        }

        // update only nftCost
        const profession = await professionSchema.findByIdAndUpdate(
            req.body.id,
            { nftCost },
            { new: true }
        );

        if (!profession) {
            sendRes(res, 404, false, 'Profession not found')
        }
        sendRes(res, 200, true, profession)

    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};


/* -------------------------------------------------- */
/* SOFT DELETE */
/* -------------------------------------------------- */

const remove = async (req, res) => {
    try {
        await deactivateProfession(req.params.key);

        res.json({
            success: true,
            message: 'Profession deactivated',
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};



module.exports = {
    create,
    getAllProfession,
    getById,
    getByKey,
    update,
    remove,
    updateNFTCost
};

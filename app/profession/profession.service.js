const Profession = require('./profession.schema');

/* -------------------------------------------------- */
/* Helpers
/* -------------------------------------------------- */

const normalizeKey = (key) => key.replace(/[_\s]/g, '').toUpperCase();

/* -------------------------------------------------- */
/* CREATE
/* -------------------------------------------------- */

const createProfession = async (data) => {
    return Profession.create({
        ...data,
        key: normalizeKey(data.key),
    });
};

/* -------------------------------------------------- */
/* READ
/* -------------------------------------------------- */

const getAllProfessions = async (filter = {}) => {
    return Profession.find(filter).lean().sort({ createdAt: -1 });
};

const getActiveProfessions = async () => {
    return Profession.find({ isActive: true }).lean().sort({ key: 1 });
};

const getProfessionById = async (id) => {
    return Profession.findById(id).lean();
};

const getProfessionByKey = async (key) => {
    return Profession.findOne({
        key: normalizeKey(key),
    }).lean();
};

/* -------------------------------------------------- */
/* UPDATE
/* -------------------------------------------------- */

const updateProfessionById = async (id, data) => {
    if (data.key) {
        data.key = normalizeKey(data.key);
    }

    return Profession.findByIdAndUpdate(id, { $set: data }, { new: true });
};

const updateProfessionByKey = async (key, data) => {
    if (data.key) {
        data.key = normalizeKey(data.key);
    }

    return Profession.findOneAndUpdate({ key: normalizeKey(key) }, { $set: data }, { new: true });
};

/* -------------------------------------------------- */
/* DELETE
/* -------------------------------------------------- */

const deleteProfessionById = async (id) => {
    return Profession.findByIdAndDelete(id);
};

/* Soft delete (recommended for games) */
const deactivateProfession = async (key) => {
    return Profession.findOneAndUpdate(
        { key: normalizeKey(key) },
        { $set: { isActive: false } },
        { new: true },
    );
};

/* -------------------------------------------------- */
/* SEED SUPPORT (VERY IMPORTANT)
/* Bulk upsert used by seed script
/* -------------------------------------------------- */

const bulkUpsertProfessions = async (professions = []) => {
    const operations = professions.map((prof) => ({
        updateOne: {
            filter: { key: normalizeKey(prof.key) },
            update: {
                $set: {
                    ...prof,
                    key: normalizeKey(prof.key),
                },
            },
            upsert: true,
        },
    }));

    return Profession.bulkWrite(operations);
};

/* -------------------------------------------------- */

module.exports = {
    createProfession,
    getAllProfessions,
    getActiveProfessions,
    getProfessionById,
    getProfessionByKey,
    updateProfessionById,
    updateProfessionByKey,
    deleteProfessionById,
    deactivateProfession,
    bulkUpsertProfessions,
};

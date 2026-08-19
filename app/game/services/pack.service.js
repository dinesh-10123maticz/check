const pack = require('../schema/pack.schema')

const FindOnePack = async (data) => {
    return await pack.findOne(data)
}

const FindPack = async (data) => {
    return await pack.find(data)
}

const CreatePack = async (data) => {
    return await pack.create(data)
}

const InsertMany = async (data) => {
    return await pack.insertMany(data)
}


module.exports = {
    FindOnePack,
    FindPack,
    CreatePack,
    InsertMany
}
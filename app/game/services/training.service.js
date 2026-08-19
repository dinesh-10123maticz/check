import training from '../schema/training.schema'


export const createTraining = async (data) => {
    await training.create(data)
}

export const insertManyTraining = async (data) => {
    return await training.insertMany(data)
}

export const findTraining = async (data) => {
    return await training.find(data).populate("nftId")
}
export const findOneTraining = async (data) => {
    return await training.findOne(data).populate("nftId")
}

export const findOneAndUpdateTraining = async (data, update) => {
    return await training.findOneAndUpdate(data, update)
}
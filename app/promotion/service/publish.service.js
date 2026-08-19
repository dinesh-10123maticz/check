import publish from '../schema/publish.schema';

export const CreatePublish = async (data) => {
    return await publish.create(data);
};
export const FindPublish = async (data) => {
    return await publish.find(data);
};
export const FindOnePublish = async (data) => {
    return await publish.findOne(data);
};
export const FindOneAndUpdatePublish = async (find, update) => {
    return await publish.findOneAndUpdate(find, update);
};

export const DeletePublish = async (data) => {
    return await publish.findOneAndDelete(data);
};

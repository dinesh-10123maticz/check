const gameChat = require('./schema/chat.schema');

const gameChatCreate = async (data) => {
    return await gameChat.create(data);
};
module.exports = { gameChatCreate };

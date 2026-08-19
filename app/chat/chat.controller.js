const { socketSend } = require('../../shared/commonFunction');
const { gameChatCreate } = require('./chat.service');
const logger = require('../../utils/logger');
const sendMessage = async (io, socket, data) => {
    const { userId, userName, type, content, roomId } = data;

    try {
        const payload = {
            userId: userId,
            userName: userName,
            type: type,
            roomId: roomId,
            content: content,
        };
        const result = await gameChatCreate(payload);

        io.to(roomId).emit('receive_message', socketSend(201, true, `receive message`, payload));
    } catch (e) {
        logger.error('Error:sendMessage', e);
    }
};

const JoinRoom = async (io, socket, data) => {
    const { roomId } = data;

    try {
        socket.join(roomId);

        socket.emit(
            'joined',
            socketSend(201, true, `joined`, {
                content: ` ${'you'} joined the chat`,
            }),
        );
    } catch (e) {
        logger.error('Error:JoinRoom', e);
    }
};

module.exports = {
    sendMessage,
    JoinRoom,
};

const { sendMessage, JoinRoom } = require('./chat.controller');

/*
send_message
update_chat

send_emoji
update_emoji
*/

const chatSocket = (socket, io) => {
    socket.on('send_message', async (data) => {
        sendMessage(io, socket, data);
    });

    socket.on('join', async (data) => {
        JoinRoom(io, socket, data);
    });
};
module.exports = chatSocket;

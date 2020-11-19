const mongoose = require('mongoose');

const ChatMessageSchema = mongoose.Schema({
    cmid: {
        type: String
    },
    channelid: {
        type: String
    }
})

module.exports = mongoose.model('ChatMessages', ChatMessageSchema);
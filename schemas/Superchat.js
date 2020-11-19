const mongoose = require('mongoose');

const SuperchatSchema = mongoose.Schema({
    scid: {
        type: String
    },
    channelid: {
        type: String
    }
})

module.exports = mongoose.model('Superchats', SuperchatSchema);
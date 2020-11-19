const mongoose = require('mongoose');

const MemberSchema = mongoose.Schema({
    mbid: {
        type: String
    },
    channelid: {
        type: String
    }
})

module.exports = mongoose.model('Members', MemberSchema);
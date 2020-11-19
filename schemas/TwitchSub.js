const mongoose = require('mongoose');

const TwitchSubSchema = mongoose.Schema({
    tsid: {
        type: String
    }
})

module.exports = mongoose.model('TwitchSubs', TwitchSubSchema);
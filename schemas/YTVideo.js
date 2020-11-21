const mongoose = require('mongoose');

const YTVideoSchema = mongoose.Schema({
    vdid: {
        type: String
    },
    name: {
        type: String
    },
    description: {
        type: String
    }
})

module.exports = mongoose.model('YTVideos', YTVideoSchema);
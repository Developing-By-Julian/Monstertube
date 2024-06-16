const mongoose = require('mongoose');

const woordSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true
    },
    woord: {
        type: String,
        required: true
    }
});

const Woord = mongoose.model('Woord', woordSchema);

module.exports = Woord

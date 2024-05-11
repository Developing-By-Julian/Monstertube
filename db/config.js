const mongoose = require('mongoose');
const configSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: String,
        default: null
    },
});

const Config = mongoose.model('Config', configSchema);

module.exports = { Config };

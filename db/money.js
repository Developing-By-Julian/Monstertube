const mongoose = require('mongoose');

const dailySchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true
    },
    roleId: {
        type: String,
        required: true
    },
    roleName: {
        type: String,
        required: true
    },
    reward: {
        type: Number,
        required: true
    }
});

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    lastClaimed: {
        type: Date,
        default: null
    },
    cash: {
        type: Number,
        default: 0,
        required: true
    },
    bank: {
        type: Number,
        default: 0,
        required: true
    },
    pincode: {
        type: Number,
        required: true
    }
});

const DailyReward = mongoose.model('DailyReward', dailySchema);
const User = mongoose.model('User', userSchema);

module.exports = { DailyReward, User };

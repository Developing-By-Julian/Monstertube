// src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    inventory: [{ name: String, value: Number }],
    coins: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
});

module.exports = mongoose.model('FishUser', userSchema);

const mongoose = require('mongoose');

// Definieer het geschiedenisitem schema
const historyItemSchema = new mongoose.Schema({
    action: { type: String, required: true },
    moderatorId: { type: String, required: true },
    reason: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

// Definieer het gebruikersschema met een array van geschiedenisitems
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    history: [historyItemSchema]
});

// Model voor de gebruiker
const User = mongoose.model('History', userSchema);

module.exports = User;

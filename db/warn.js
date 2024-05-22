const mongoose = require('mongoose');

// Definieer het gebruikersschema
const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
  guildId: {
    type: String,
    required: true
  },
  moderatorId: {type: String},
  reason: {type: String},
  timestamp: { type: Date, default: Date.now },
  warnId: {type: String,
     required: true,
      unique: true }
});

// Maak het model aan op basis van het schema
const User = mongoose.model('Warn', userSchema);

module.exports = User;

const mongoose = require('mongoose');

// Definieer het gebruikersschema
const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
  tijd: {
    type: String,
    required: true
  },
  guildId: {
    type: String,
    required: true
  }
});

// Maak het model aan op basis van het schema
const User = mongoose.model('Mute', userSchema);

module.exports = User;

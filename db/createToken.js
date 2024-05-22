const mongoose = require("mongoose")
const tokenSchema = new mongoose.Schema({
    email: String,
    token: String
})
const TokenSchema = mongoose.model("Token", tokenSchema)

module.exports = TokenSchema
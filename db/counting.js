const mongoose = require("mongoose")
const countingSchema = new mongoose.Schema({
    lastUsed: String,
    count: Number
})
const CountingSchema = mongoose.model("Counting", countingSchema)

module.exports = CountingSchema
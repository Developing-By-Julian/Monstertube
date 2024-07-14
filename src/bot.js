// Imports
const client = require("./botClient")
const app = require("../dashboard/expressClient")
require("dotenv").config()
const port = process.env.PORT || 3001

// Loaders
const loadCommands = require("./loaders/commands")
loadCommands()
const loadEvents = require("./loaders/events")
loadEvents()
const loadFunctions = require("./loaders/functions")
loadFunctions()
const loadFunctionsDash = require("./loaders/loaddashfunctions")
loadFunctionsDash()
// client.on("debug", console.debug)
client.on("warn", console.warn)

app.listen(port, "0.0.0.0", function () {
	console.log("✅| Dashboard");
})
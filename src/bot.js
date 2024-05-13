// Imports
const client = require("./botClient")
const app = require("../dashboard/expressClient")
require("dotenv").config()

// Loaders
const loadCommands = require("./loaders/commands")
loadCommands()
const loadEvents = require("./loaders/events")
loadEvents()
const loadFunctions = require("./loaders/functions")
loadFunctions()
// client.on("debug", console.debug)
client.on("warn", console.warn)

app.listen("3000", () => {
	console.log("✅| Dashboard");
})
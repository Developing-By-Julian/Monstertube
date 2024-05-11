const fs = require('node:fs');
const path = require('node:path');
const client = require("./botClient")
require("dotenv").config()
const app = require("./expressClient")

const loadCommands = require("./loaders/commands")
loadCommands()
const loadEvents = require("./loaders/events")
loadEvents()
const loadFunctions = require("./loaders/functions")
loadFunctions()


// client.on("debug", console.debug)
client.on("warn", console.warn)

app.listen("3000", () => {
	console.log("✅|Dashboard online");
})
client.login(process.env.TOKEN)

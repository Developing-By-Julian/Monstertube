const {Client, GatewayIntentBits} = require("discord.js")
const client = new Client({ intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds] })
require("dotenv").config()

module.exports = client
const { Client, GatewayIntentBits, ActivityType } = require("discord.js")
const client = new Client({
    intents:
        [
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.Guilds,
            GatewayIntentBits.DirectMessages

        ],
        presence: {
            activities: [{
                type: ActivityType.Custom,
                name: "custom", // name is exposed through the API but not shown in the client for ActivityType.Custom
                state: "MONSTEGANNG ON TOP!"
            }]
        }



})
require("dotenv").config()
client.login(process.env.TOKEN)

module.exports = client
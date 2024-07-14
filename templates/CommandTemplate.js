const { SlashCommandBuilder, Client, ChatInputCommandInteraction } = require("discord.js");

const command = new SlashCommandBuilder()
.setName("")
.setDescription("")
/**
 * 
 * @param {Client} client 
 * @param {ChatInputCommandInteraction} interaction 
 */
async function execute(client, interaction) {

}
module.exports = {
    catagory: "",
    data: command,
    execute: execute
}




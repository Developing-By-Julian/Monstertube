const { EmbedBuilder } = require("discord.js");

async function createEmbed(color, title, des) {

    const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor(color)
    .setDescription(des)
    .setFooter({text: "Made by - Developing By Julian / JulianRJC (https://discord.gg/NtDeTbBJDk)"})

    return embed


}

module.exports = createEmbed
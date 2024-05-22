const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js")
const schema = require('../../../db/money').User;
const client = require("../../../src/botClient")
module.exports = {
    catagory: "Currency",
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Zie de leaderboard!'),
    async execute(cloent, interaction) {
       
       const leaderboard = await schema.find().limit(10).sort({cash: -1, bank: -1})
        const e = new EmbedBuilder()
        e.setTitle(`Leaderboard voor: ${interaction.guild.name}`)
        .setDescription(`<@${interaction.user.id}> Zie onderstaande lijst`)
        .setColor('#0099ff')
        .setFooter({text: "Made by - Developing By Julian / JulianRJC (https://discord.gg/NtDeTbBJDk)"})
            for (const user of leaderboard) {
            const user_fetch = await client.users.fetch(user.userId)

            e.addFields({ name: `${user_fetch.username}:`, value: ` Cash: €${user.cash} Bank: €${user.bank} Total: €${user.bank + user.cash}` });
        }

        interaction.reply({content: "", embeds: [e], ephemeral: true })





    },
};
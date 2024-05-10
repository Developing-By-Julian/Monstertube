const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const schema = require("../../db/money").User
module.exports = {
    data: new SlashCommandBuilder()
        .setName('seemoney')
        .setDescription('Zie hoeveel geld je hebt!!'),
    async execute(client, interaction) {
       
        const money = await schema.findOne({userId: interaction.user.id}).then(data => {
            return data.money
        })

    await interaction.reply({ content: `Uw heeft: €${money}`, ephemeral: true  });




    },
};
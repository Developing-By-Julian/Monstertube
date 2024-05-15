const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js")
const schema = require("../../db/money").User
module.exports = {
    data: new SlashCommandBuilder()
        .setName('seemoney')
        .setDescription('Zie hoeveel geld je hebt!!'),
    async execute(client, interaction) {
       
        const money = await schema.findOne({userId: interaction.user.id}).then(data => {
            return data
        })
        
        const e = new EmbedBuilder()
        e.setTitle(`Portemonnee: `)
        e.setDescription("Zie onderstaande lijst")
        e.setFields({name: 'Cash', value: `${money.cash}`}, {name: "Bank", value: `${money.bank}`})

    await interaction.reply({ content: ``, embeds: [e], ephemeral: true  });




    },
};
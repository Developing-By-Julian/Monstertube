const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js")
const schema = require("../../../db/money").User
module.exports = {
    catagory: "Currency",
    data: new SlashCommandBuilder()
        .setName('seemoney')    .setDMPermission(false)

        .setDescription('Zie hoeveel geld je hebt!!'),
    async execute(client, interaction) {
       
        const money = await schema.findOne({userId: interaction.user.id}).then(data => {
            return data
        })
        if (!money) {
            return await interaction.reply({content: "Je hebt nog geen bankrekening"})
        }
        const e = new EmbedBuilder()
        e.setTitle(`Portemonnee: `)
        e.setDescription("Zie onderstaande lijst")
        e.setFields({name: 'Cash', value: `${money.cash}`}, {name: "Bank", value: `${money.bank}`})

    await interaction.reply({ content: ``, embeds: [e], ephemeral: true  });




    },
};
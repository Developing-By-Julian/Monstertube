const { SlashCommandBuilder } = require("discord.js");
const history = require("../../../db/warn")
const { EmbedBuilder } = require("@discordjs/builders");
module.exports = {
    catagory: "Moderatie", 
    data: new SlashCommandBuilder()
    .setName('getwarns')
    .setDescription("Toont de warns van een persoon")
    .addUserOption(option => option.setName("target").setDescription("De gebruiker").setRequired(true))
    ,
    async execute(client, interaction) {

        const targetUser = interaction.options.getUser('target');

        if (!targetUser) {
            return interaction.reply('Gebruiker niet gevonden.');
        }

        try {
            const user = await history.find({userId: targetUser.id})

            if (!user || user.length === 0) {
                return interaction.reply('Geen warns gevonden voor deze gebruiker.');
            }

            const embed = new EmbedBuilder()
            .setTitle(`Warns van: ${targetUser.tag}`)

       user.forEach((item, index) => {
                embed.addFields({ 
                    name: `WarnID: ${item.warnId}\n\n`,
                    value: `
                        **Moderator:** <@${item.moderatorId}>
                        **Reden:** ${item.reason}
                        **Tijdstip:** ${item.timestamp},
                    `,
                });
            })

            interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Fout bij het ophalen van de geschiedenis:', error);
            interaction.reply('Er is een fout opgetreden bij het ophalen van de geschiedenis.');
        }
}
}
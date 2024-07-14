const { SlashCommandBuilder } = require("discord.js");
const his_schema = require("../../../db/history")
const { EmbedBuilder } = require("@discordjs/builders");
module.exports = {
    catagory: "Moderatie", 
    data: new SlashCommandBuilder()
    .setName('gethistory')
    .setDescription("Toont de geschiedenis van een persoon")
    .addUserOption(option => option.setName("target").setDescription("De gebruiker").setRequired(true))    .setDMPermission(false)

    ,
    async execute(client, interaction) {

        const targetUser = interaction.options.getUser('target');

        if (!targetUser) {
            return interaction.reply('Gebruiker niet gevonden.');
        }

        try {
            const user = await history.findOne({userId: targetUser.id})

            if (!user || user.history.length === 0) {
                return interaction.reply('Geen geschiedenis gevonden voor deze gebruiker.');
            }

            const embed = new EmbedBuilder()
            .setTitle(`Geschiedenis van: ${targetUser.tag}`)

            user.history.forEach((item, index) => {
                embed.addFields({ 
                    name: `Actie ${index + 1}`,
                    value: `
                        **Actie:** ${item.action}
                        **Moderator:** <@${item.moderatorId}>
                        **Reden:** ${item.reason}
                        **Tijdstip:** ${item.timestamp}
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
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")

module.exports = {
    catagory: "Currency",
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim je daily!'),
    async execute(client, interaction) {
       
       

        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('claim_daily')
                .setLabel('Claim je dagelijkse beloning')
                .setStyle(ButtonStyle.Primary)
        );

    await interaction.reply({ content: 'Klik op de knop om je dagelijkse beloning te claimen:', components: [row], ephemeral: true  });




    },
};
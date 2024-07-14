const {SlashCommandBuilder, EmbedBuilder} = require("discord.js")
require("dotenv").config()
module.exports = {
    catagory: "Overig",
	data: new SlashCommandBuilder()
		.setName('restart')    .setDMPermission(false)

		.setDescription('Restart de bot!'),
	async execute(client, interaction) {

        if (
            !interaction.member.id === '1190271775649562658' // JulianRJC
        ) {
            return interaction.reply("GEEN PERMISSIES");
        }

        client.destroy()
        client.login(process.env.TOKEN)

await interaction.reply({content: "Client is aan het herstarten", ephemeral: true})

	},
};
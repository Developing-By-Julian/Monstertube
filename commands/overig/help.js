const {SlashCommandBuilder, EmbedBuilder} = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Deze command!'),
	async execute(client, interaction) {


const commands = client.commands
const e = new EmbedBuilder()
.setTitle("Hulp voor "+ interaction.guild.name)
.setDescription(`<@${interaction.user.id}> Zie onderstaande lijst`)
.setFooter({text: "Made by - Developing By Julian / JulianRJC3 (https://discord.gg/NtDeTbBJDk)"})
commands.forEach((value, key) => {
    e.addFields({name: key, value: value.data.description})
});

await interaction.reply({embeds: [e], ephemeral: true})

	},
};
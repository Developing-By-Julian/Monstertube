const {SlashCommandBuilder, EmbedBuilder} = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!')
        ,
	async execute(client, interaction) {



		await interaction.deferReply()

		const laden = await interaction.editReply({content: "ladenn....."})

		const ws = interaction.client.ws.ping
		const Api = Date.now() - laden.createdTimestamp;

		let uptime = Math.floor(interaction.client.uptime / 86400000)


		const embed = new EmbedBuilder()
		.setColor("Blue")
		.setFooter({text: "Made by - Developing By Julian / JulianRJC (https://discord.gg/NtDeTbBJDk)"})
		.addFields(
			{
				name: 'Client:',
				value: `${ws}ms`,
			},
			{
				name: 'API',
				value: `${Api}`
			},
			{
				name: "Uptime",
				value: `\ ${uptime} Dagen`
			}
		)

		await laden.edit({embeds: [embed], ephemeral: true})

		
	},
};
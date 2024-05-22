const {SlashCommandBuilder, EmbedBuilder} = require("discord.js")
const his_schema = require("../../../db/history")
module.exports = {
    catagory: "Moderatie", 
	data: new SlashCommandBuilder()
		.setName('clearhistory')
		.setDescription('Clear iemand zijn volledige history (Staff)')
        .addUserOption(option => option.setName("target").setDescription('User').setRequired(true))

        ,
	async execute(client, interaction) {

        if (
            !interaction.member.roles.cache.some(role => role.id === '1236403079432241284') && // Monster ticket helper
            !interaction.member.roles.cache.some(role => role.id === '1234784803501641728') && // Admin
            !interaction.member.id === interaction.guild.ownerID // Server Owner
        ) {
            console.log('Gebruiker heeft niet een van de vereiste rollen.');
            return interaction.reply("GEEN PERMISSIES");
        }

        const useroption = interaction.options.getUser('target')
        const member = interaction.guild.members.cache.get(useroption.id)

        his_schema.findOneAndDelete({userId: member.id}).then(
            interaction.reply({content: `History verwijderd voor <@${member.id}>`, ephemeral: true})
        )



    },
};
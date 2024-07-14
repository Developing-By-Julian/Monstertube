const {SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require("discord.js")
const schema = require("../../../db/warn")
const history = require("../../../db/history")
const { updateUserHistory } = require('../../functions/history');

module.exports = {
    catagory: "Moderatie", 
	data: new SlashCommandBuilder()
		.setName('removewarn')
		.setDescription('Remove een warn van een persoon (Staff)!')
        .addStringOption(option => option.setName("id").setDescription("De warnid").setRequired(true))
        .setDMPermission(false)

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

        const warnid = interaction.options.getString("id") 

        const warn = schema.findOne({warnId: warnid})
        console.log(warn);
        const MEMBER = interaction.guild.members.fetch(warn)

        try {
            await updateUserHistory(warn.userId, "unwarn", interaction.user.id, reden);
        } catch (error) {
            // Behandel de fout indien nodig
            console.error('Fout bij het bijwerken van de gebruikersgeschiedenis:', error);
            return interaction.reply('Er is een fout opgetreden bij het bijwerken van de gebruikersgeschiedenis.');
        }
    await interaction.guild.channels.cache.get("1236646677604077711").send(`${MEMBER.user.tag} zijn warn is verwijdt (${warnid}). Deze actie is uitgevoerd door: ${interaction.user.tag}`);
    await interaction.reply(`${MEMBER.user.tag} zijn warn is verwijdt (${warnid}).`)




	},
};
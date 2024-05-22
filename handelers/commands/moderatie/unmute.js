const {SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require("discord.js")
const schema = require("../../../db/mute")
module.exports = {
    catagory: "Moderatie", 
	data: new SlashCommandBuilder()
		.setName('unmute')
		.setDescription('Unmute een persoon (Staff)!')
        .addUserOption(option => option.setName("gebruiker").setDescription("De gebruiker").setRequired(true))
        .addStringOption(option => option.setName("reden").setDescription("De reden van de mute"))

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

        const member = interaction.options.getUser("gebruiker")
        var reden = interaction.options.getString("reden")
        if (!reden || reden.length === 0) {
            reden = "Geen reden opgegeven";
        }
        // const muteRole = interaction.guild.roles.cache.get("885072974720421937");
        const muteRole = interaction.guild.roles.cache.get("1236308555175559248")
        if (!muteRole) {
            return interaction.reply('Mute role niet gevonden!');
        }
        if(!member) {
            return interaction.reply("Member niet gevonden")
        }
        const MEMBER = interaction.guild.members.cache.get(member.id)
        await MEMBER.roles.remove(muteRole);

        schema.findOneAndDelete({userId: MEMBER.user.id})
    await interaction.guild.channels.cache.get("1236646677604077711").send(`${MEMBER.user.tag} is geunmute voor reden: ${reden}. Deze actie is uitgevoerd door: ${interaction.user.tag}`);
    await interaction.reply(`${MEMBER.user.tag} is geunmute voor reden: ${reden}`)




	},
};
const {SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require("discord.js")
const schema = require("../../../db/warn")
const history = require("../../../db/history")
const { updateUserHistory } = require('../../functions/history');

module.exports = {
    catagory: "Moderatie", 
	data: new SlashCommandBuilder()
		.setName('warn')
		.setDescription('Warn een persoon (Staff)!')
        .addUserOption(option => option.setName("gebruiker").setDescription("De gebruiker").setRequired(true))
        .addStringOption(option => option.setName("reden").setDescription("De reden van de warn"))

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
        if(!member) {
            return interaction.reply("Member niet gevonden")
        }
        const MEMBER = interaction.guild.members.cache.get(member.id)
      
        function generateRandomId(length) {
            let result = '';
            const characters = '123456789!@';
            const charactersLength = characters.length;
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }
        
        const warnId = generateRandomId(30)

            const newUser = new schema({
                userId: member.id,
                guildId: interaction.guild.id,
                moderatorId: interaction.user.id,
                reason: reden,
                warnId: warnId
            })
            newUser.save()
       
        try {
            await updateUserHistory(member.id, "warn", interaction.user.id, reden);
        } catch (error) {
            // Behandel de fout indien nodig
            console.error('Fout bij het bijwerken van de gebruikersgeschiedenis:', error);
            return interaction.reply('Er is een fout opgetreden bij het bijwerken van de gebruikersgeschiedenis.');
        }
    await interaction.guild.channels.cache.get("1236646677604077711").send(`${MEMBER.user.tag} is gewarnt voor reden: ${reden}. Deze actie is uitgevoerd door: ${interaction.user.tag}`);
    await interaction.reply(`${MEMBER.user.tag} is gewarnt voor reden: ${reden}`)




	},
};
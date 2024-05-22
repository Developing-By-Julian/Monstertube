const {SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, Embed} = require("discord.js")
const schema = require("../../../db/mute")
const history = require("../../../db/history")
const { updateUserHistory } = require('../../functions/history');

module.exports = {
    catagory: "Moderatie", 
	data: new SlashCommandBuilder()
		.setName('mute')
		.setDescription('Mute een persoon (Staff)!')
        .addUserOption(option => option.setName("gebruiker").setDescription("De gebruiker").setRequired(true))
        .addIntegerOption(option => option.setName("tijd").setDescription("De tijd dat een persoon gemute is in minuten").setRequired(true))
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
        const tijd = interaction.options.getInteger("tijd")
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
        await MEMBER.roles.add(muteRole);
        const unmuteTime = new Date(Date.now() + tijd * 60000);
        const exuser = await schema.findOne({userId: member.id})
        console.log(` Exuser: ${exuser}`);
        try {
            if (exuser) {
                console.log("There is a exuser")
                return interaction.reply({content: `<@${member.id}> Is al gemute`, ephemeral: true })
            } else {
                const newUser = new schema({
                    userId: member.id,
                    tijd: unmuteTime,
                    guildId: interaction.guild.id
                })
                await newUser.save()
                console.log(`Newuser: ${newUser}`);
            }
        } catch (error) {
            console.log(error);
        }
       
        try {
            await updateUserHistory(member.id, "mute", interaction.user.id, reden);
        } catch (error) {
            // Behandel de fout indien nodig
            console.error('Fout bij het bijwerken van de gebruikersgeschiedenis:', error);
            return interaction.reply('Er is een fout opgetreden bij het bijwerken van de gebruikersgeschiedenis.');
        }
        const e = new EmbedBuilder()
        e.setTitle("PERSOON GEMUTE")
        .setColor("Red")
        .setFields(
            {name: "USER", value: `<@${MEMBER.id}>`},
            {name: "TIJD", value: `${tijd}`},
            {name:"REDEN", value: reden},
            {name: "MODERATOR", value: `<@${interaction.user.id}>`}
        )
    await interaction.guild.channels.cache.get("1236646677604077711").send({embeds: [e]});
    await interaction.reply(`${MEMBER.user.tag} is gemute voor ${tijd} minuten. reden: ${reden}`)




	},
};
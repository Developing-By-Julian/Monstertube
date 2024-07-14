const { SlashCommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandBuilder } = require("discord.js");
const his_schema = require("../../../db/history")

const sub_clearhistory = new SlashCommandSubcommandBuilder()
.setName("clear")
.setDescription("Clear iemands history")
.addUserOption(option => option.setName("target").setDescription('User').setRequired(true))

const sub_group_history = new SlashCommandSubcommandGroupBuilder()
.setName("history")
.setDescription("History")
.addSubcommand(sub_clearhistory)


const sub_group_mute = new SlashCommandSubcommandGroupBuilder()
.setName("mute")
.setDescription("Mute")

const sub_group_warn = new SlashCommandSubcommandGroupBuilder()
.setName("warn")
.setDescription("Warn")

const command = new SlashCommandBuilder()
.setDMPermission(false)
.setName("moderatie")
.setDescription("Algemeen moderatie command")
.addSubcommandGroup(sub_group_history)
.addSubcommandGroup(sub_group_mute)
.addSubcommandGroup(sub_group_warn)

function clearHistory(interaction) {
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
}
module.exports = {
    catagory: "Moderatie",
    data: command,
    async execute(client, interaction) {
        const subcommando = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        if (subcommando === "clear") {
            clearHistory(interaction)
        }

    }
}
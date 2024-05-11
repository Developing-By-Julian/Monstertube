const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")
const schema = require("../../db/money").DailyReward
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup_cur_seeroles')
        .setDescription('zie je currency roles')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        ,
    async execute(client, interaction) {

        const roles = (await schema.find({guildId: interaction.guild.id}))
        const e = new EmbedBuilder()
.setTitle("Setup van "+ interaction.guild.name)
.setDescription(`<@${interaction.user.id}> Zie onderstaande lijst`)
.setFooter({text: "Made by - Developing By Julian / JulianRJC3 (https://discord.gg/NtDeTbBJDk)"})


for (const index of roles) {
    const role = await interaction.guild.roles.cache.get(index.roleId)
    e.addFields({name: `Role: ${role.name}`, value: `Geld: ${index.reward}`})
}

await interaction.reply({embeds: [e],ephemeral: true})
    },
};
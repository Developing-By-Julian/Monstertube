const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js")
const schema = require('../../../db/money').DailyReward;
module.exports = {
    catagory: "Setup",
    data: new SlashCommandBuilder()
        .setName('setup_cur_roles')
        .setDescription('Setup je currency roles')    .setDMPermission(false)

        .addRoleOption(option => option.setName("role").setDescription("De Role").setRequired(true))
        .addNumberOption(option => option.setName("geld").setDescription("Vul in hoeveel de role dagelijks moet krijgen").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        ,
    async execute(client, interaction) {
        const role = interaction.options.getRole("role")
        const money = interaction.options.getNumber("geld")
        try {
            const role_F = await schema.findOne({roleId: role.id}).then(data => {
                return data
            })

            const rolename = role.name
            if (role_F) {
                await interaction.reply({content: 'Role bestaat al', ephemeral: true})
            } else {
                const newRole = new schema({
                    guildId: interaction.guild.id,
                    roleId: role.id,
                    roleName: rolename,
                    reward: money
                })
                    newRole.save()
                    console.log(newRole);
                    await interaction.reply({content: `Role id: ${role.id} is toegevoegd`, ephemeral: true})
            }
     
        } catch (error) {
            console.log(error);
            await interaction.reply("Error")
        }


    },
};
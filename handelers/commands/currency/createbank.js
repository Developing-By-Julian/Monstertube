const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js")
const client = require("../../../src/botClient")
const schema = require('../../../db/money').User;

const { SlashCommandBuilder, Client, ChatInputCommandInteraction } = require("discord.js");

const command = new SlashCommandBuilder()
.setName('createbank')
.setDMPermission(false)
.setDescription('Maak een bankrekening aan!')
/**
 * 
 * @param {Client} client 
 * @param {ChatInputCommandInteraction} interaction 
 */
async function execute(c, interaction) {
    const e_user = await schema.findOne({userid: interaction.user.id})
    console.log(e_user);
    if (e_user) {
      return interaction.reply({content: 'Je hebt al een bankrekening'})
    } else if (!e_user) {
     const p_msg = await interaction.user.send("Maak een 4 cijferige pincode:")
     await interaction.reply({content: 'Je hebt een prive bericht ontvangen'})

     
     const collector = p_msg.channel.createMessageCollector({time: 60000, max: 1})

     collector.on("collect", async message => {
         try {
             const gebruiker = new schema({
                 userId: interaction.user.id,
                 bank: 0,
                 cash: 0,
                 lastClaimed: null,
                 pincode: message.content,
                 lastSteal: null,
                 username: interaction.user.username
             })
             await gebruiker.save()
             await interaction.user.send('Je pincode is succesvol ingesteld.');
             await interaction.editReply({content: "Pincode ingesteld", ephemeral: true})
         } catch (error) {
             console.error('Fout bij het instellen van de pincode:', error);
         await interaction.user.send('Er is een fout opgetreden bij het instellen van de pincode.');
         }
     })
     collector.on('end', collected => {
         if (collected.size === 0) {
             interaction.user.send('Je hebt niet op tijd gereageerd. De pincode-instelling is geannuleerd.');
         }
     });
    }

}
module.exports = {
    catagory: "Currency",
    data: command,
    execute: execute
}




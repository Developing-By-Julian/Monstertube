const { SlashCommandBuilder, EmbedBuilder, ActionRow, ActionRowBuilder, ButtonBuilder, Client, ButtonStyle, ChatInputCommandInteraction } = require("discord.js");
const client = require("../../../src/botClient")
function groupCommandsByCategory(commands) {
    const categories = new Map();
  
    for (const [name, command] of commands) {
      const category = command.catagory || 'Uncategorized';
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category).push(command);
    }
  
    return categories;
  }
/**
 * 
 * @param {Client} client 
 * @param {ChatInputCommandInteraction} interaction 
 */
  async function execute(C, interaction) {
    const commands = client.commands
    const categories = groupCommandsByCategory(commands);
    const embeds = [];
    for (const [category, commands] of categories) {
        const embed = new EmbedBuilder()
          .setTitle(`Help - ${category}`)
          .setDescription('Hier is een lijst van alle beschikbare commands:')
          .setColor('#00FF00');
  
        embed.addFields(commands.map(cmd => ({
          name: `\`${cmd.data.name}\``,
          value: cmd.data.description,
          inline: true,
        })));
  
        embeds.push(embed);
      }

      let currentPage = 0;

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('previous')
            .setLabel('Previous')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next')
            .setStyle(ButtonStyle.Primary),
        );
    
        const message = await interaction.reply({ embeds: [embeds[currentPage]], components: [row], fetchReply: true });
        const filter = i => i.customId === 'previous' || i.customId === 'next';
        const collector = message.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'previous') {
              currentPage = currentPage > 0 ? --currentPage : embeds.length - 1;
            } else if (i.customId === 'next') {
              currentPage = currentPage + 1 < embeds.length ? ++currentPage : 0;
            }
      
            await i.update({ embeds: [embeds[currentPage]], components: [row] });
          });

          collector.on('end', collected => {
            const disabledRow = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId('previous')
                  .setLabel('Previous')
                  .setStyle(ButtonStyle.Primary)
                  .setDisabled(true),
                new ButtonBuilder()
                  .setCustomId('next')
                  .setLabel('Next')
                  .setStyle(ButtonStyle.Primary)
                  .setDisabled(true),
              );
            message.edit({ components: [disabledRow] });
          });
}

module.exports = {
    catagory: "Overig",
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Deze command!'),
    execute: execute
};
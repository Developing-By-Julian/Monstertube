const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const client = require("../../../src/botClient")
module.exports = {
    catagory: "Overig",
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Deze command!'),
    async execute(C, interaction) {
        // const commands = client.commands;
        // console.log(`All Commands: ${Array.from(commands)}`);

        // // Extracting categories from the list of commands
        // let categories = new Set()

        // for (let i = 1; i < commands.length; i += 2) {
        //     categories.add(commands[i].catagory);
        // }

        // // Check if categories are extracted correctly
        // if (categories.size > 0) {
        //     console.log(`Categories: ${Array.from(categories)}`);

        //     // Prepare the message content
        //     let messageContent = "Categories:\n";
        //     messageContent += Array.from(categories).join(', ');

        //     // Send the message
        //     interaction.reply({ content: messageContent });
        // } else {
        //     console.error("No categories found.");
        // }

        // const embeds = [];

        // categories.forEach(catagory => {
        //     const commandsInCategory = Array.from(categories).filter(command => command.catagory === catagory);
        //     console.log(`Commands in ${catagory}: ${commandsInCategory}`);

        //     const embed = new EmbedBuilder()
        //         .setTitle(`${catagory}`)
        //     commandsInCategory.forEach(command => {
        //         // Log the command object to see its structure
        //         console.log('Command:', command);

        //         // Check if command and command.data are defined
        //         if (command && command.data) {
        //             embed.addFields({
        //                 name: command.data.name,
        //                 value: command.data.description
        //             });
        //         } else {
        //             console.warn(`Command or command.data is undefined for command:`, command);
        //         }
        //     });



        //     embeds.push(embed);
        // });

        // console.log(`Embeds: ${embeds}`);

        // await interaction.reply({ embeds: embeds, ephemeral: true })
        //     .catch(error => console.error('Error while replying:', error));

        await interaction.reply({content: "Command in onderhoud", ephermeral: true})
    },
};
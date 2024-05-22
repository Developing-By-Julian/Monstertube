const { SlashCommandBuilder, SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Gebruiker = require('../../../db/money').User;

// Deposit subcommando
const stortenSubcommando = new SlashCommandSubcommandBuilder()
    .setName('storten')
    .setDescription('Geld storten op je bankrekening')
    .addIntegerOption(option =>
        option.setName('bedrag')
            .setDescription('Het bedrag dat je wilt storten')
            .setRequired(true));

// Withdraw subcommando
const opnemenSubcommando = new SlashCommandSubcommandBuilder()
    .setName('opnemen')
    .setDescription('Geld opnemen van je bankrekening')
    .addIntegerOption(option =>
        option.setName('bedrag')
            .setDescription('Het bedrag dat je wilt opnemen')
            .setRequired(true));

module.exports = {
    catagory: "Currency",
    data: new SlashCommandBuilder()
        .setName('geld')
        .setDescription('Beheer je geld')
        .addSubcommandGroup(subcommand =>
            subcommand.setName('bank')
                .setDescription('Beheer je bankrekening')
                .addSubcommand(stortenSubcommando)
                .addSubcommand(opnemenSubcommando)),
    async execute(c, interaction) {
        const subcommando = interaction.options.getSubcommand();
        const gebruikerId = interaction.user.id;
        
        if (subcommando === 'storten') {
            const bedrag = interaction.options.getInteger('bedrag');

            try {
                let gebruiker = await Gebruiker.findOne({ userId: gebruikerId });
                if (!gebruiker) {
                    // gebruiker = new Gebruiker({ gebruikerId, bank: 0 }); // Maak nieuwe gebruiker aan indien niet gevonden
                    interaction.reply({content: 'Je hebt nog geen rekening. Maak een rekening via /createbank', ephemeral: true})
                }
                if (gebruiker.cash < bedrag) {
                    return await interaction.reply({content: 'Je hebt niet genoeg contant geld.', ephemeral: true});
                } {
                    const p_msg = await interaction.user.send("Vul pincode in:")
                    await interaction.reply({content: "Er is een prive bericht verstuurt", ephemeral: true})
                    const collector = p_msg.channel.createMessageCollector({time: 60000, max: 1})
                    collector.on("collect", async msg => {
              
                        // Zet beide waarden om naar strings
                        const ingevoerdePincode = msg.content.toString();
                        const opgeslagenPincode = gebruiker.pincode.toString();
    
                        if (ingevoerdePincode === opgeslagenPincode) {
                            gebruiker.bank += bedrag;
                            gebruiker.cash -= bedrag;
                            await gebruiker.save();
                            await interaction.editReply({content: `Succesvol ${bedrag} gestort op je bankrekening.`,ephemeral: true});
                            await p_msg.channel.send("Succesvol bedradg gestord. Je kan terug naar de server")
                        } else {
                            console.log(ingevoerdePincode, opgeslagenPincode);
                            await interaction.editReply({content: "Foute pincode, probeer het commando opnieuw.", ephemeral: true});
                        }
                    });
                  
                }

            

            } catch (err) {
                console.error('Fout bij geld storten:', err);
                await interaction.reply({content: 'Er is een fout opgetreden bij het storten van geld.', ephemeral: true});
            }
        } else if (subcommando === 'opnemen') {
            const bedrag = interaction.options.getInteger('bedrag');

            try {
                // Zoek gebruiker in de database
                let gebruiker = await Gebruiker.findOne({ userId: gebruikerId });
                if (!gebruiker) {
                    interaction.reply({content: 'Je hebt nog geen rekening. Maak een rekening via /createbank', ephemeral: true})
                }

                // Controleer of gebruiker genoeg saldo heeft
                if (gebruiker.bank < bedrag) {
                    console.log(gebruiker.bank, bedrag);
                    return await interaction.reply({content:'Je hebt niet genoeg geld op je bankrekening.', ephemeral: true});
                } {
                    const p_msg = await interaction.user.send("Vul pincode in:")
                    await interaction.reply("Er is een prive bericht verstuurt")
                    const collector = p_msg.channel.createMessageCollector({time: 60000, max: 1})
                    collector.on("collect", async msg => {
              
                        // Zet beide waarden om naar strings
                        const ingevoerdePincode = msg.content.toString();
                        const opgeslagenPincode = gebruiker.pincode.toString();
    
                        if (ingevoerdePincode === opgeslagenPincode) {
                            gebruiker.bank -= bedrag;
                            gebruiker.cash += bedrag
                            await gebruiker.save();
                            await interaction.editReply({content: `Succesvol ${bedrag} opgenomen van je bankrekening.`, ephemeral: true});
                            await p_msg.channel.send("Succesvol bedradg gestord. Je kan terug naar de server")
                        } else {
                            console.log(ingevoerdePincode, opgeslagenPincode);
                            await interaction.editReply({content: "Foute pincode, probeer het commando opnieuw.", ephemeral: true});
                        }
                    });
                  
              
                }

                // Werk banksaldo bij
           

            } catch (err) {
                console.error('Fout bij geld opnemen:', err);
                await interaction.reply('Er is een fout opgetreden bij het geld opnemen.');
            }
        }
    },
};

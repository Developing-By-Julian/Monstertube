const { SlashCommandBuilder } = require("discord.js");
const schema = require('../../../db/money').User;

// Functie om een willekeurig lid te selecteren dat geen bot is of de interactiegebruiker zelf
async function getRandomUser(interaction) {
    console.log("Het selecteren van een willekeurig lid begint...");
    let randomUser;
    do {
        randomUser = await interaction.guild.members.fetch().then(members => members.random());
        console.log("Willekeurig lid geselecteerd:", randomUser.user.username);
        let userMoney = await schema.findOne({ userId: randomUser.id });
    } while (randomUser.user.bot || randomUser.id === interaction.user.id || userMoney || userMoney.cash <= 0);
    console.log("Geselecteerd lid is geen bot en is niet de interactiegebruiker. En heeft geld");
    return randomUser;
}

module.exports = {
    catagory: "Currency", 
    data: new SlashCommandBuilder()
        .setName('steal')
        .setDescription('Steel een deel van iemands cash!'),
    async execute(client, interaction) {
        await interaction.deferReply();
        try {
            console.log("Commando gestart...");
            let randomUser = await getRandomUser(interaction);
            console.log("Willekeurige gebruiker geselecteerd:", randomUser.displayName);

            let userMoney = await schema.findOne({ userId: randomUser.id });
            console.log("Geld van gebruiker gevonden:", userMoney);
            let interactionUserMoney = await schema.findOne({ userId: interaction.user.id });
            console.log("Geld van interactiegebruiker gevonden:", interactionUserMoney);

            const currentTime = new Date();
            let lastStealTime = interactionUserMoney.lastSteal;
            if (!lastStealTime) {
                console.log("Laatste diefstal tijd niet gevonden voor interactiegebruiker. Instellen naar huidige tijd...");
                lastStealTime = currentTime;
                interactionUserMoney.lastSteal = lastStealTime;
                await interactionUserMoney.save();
            }

            const timeDifference = currentTime - lastStealTime;
            const hoursDifference = timeDifference / (1000 * 60 * 60);
            console.log("Tijdsverschil sinds laatste diefstal:", hoursDifference, "uur");

            if (hoursDifference < 24) {
                const remainingHours = 24 - hoursDifference;
                console.log("Gebruiker moet nog wachten om opnieuw te stelen:", remainingHours.toFixed(2), "uur");
                return interaction.editReply(`Sorry, je kunt pas na ${remainingHours.toFixed(2)} uur weer stelen.`);
            }

            const amountToSteal = Math.floor(Math.random() * userMoney.cash) + 1;
            console.log("Bedrag om te stelen:", amountToSteal);

            if (isNaN(amountToSteal) || amountToSteal <= 0) {
                console.log("Er is een fout opgetreden bij het berekenen van het gestolen bedrag.");
                return interaction.editReply("Er is een fout opgetreden bij het berekenen van het gestolen bedrag.");
            }

            userMoney.cash -= amountToSteal;
            console.log("Geld van gebruiker bijgewerkt na diefstal:", userMoney);
            
            interactionUserMoney.lastSteal = currentTime;
            await interactionUserMoney.save();

            interactionUserMoney.cash += amountToSteal;
            console.log("Geld van interactiegebruiker bijgewerkt na diefstal:", interactionUserMoney);
            await interactionUserMoney.save();

            console.log("Commando voltooid.");
            return interaction.editReply(`Je hebt ${amountToSteal} geld gestolen van ${randomUser.displayName}!`);
        } catch (error) {
            console.error("Er is een fout opgetreden:", error);
            return interaction.editReply("Er is een fout opgetreden bij het uitvoeren van het commando.");
        }
    },
};

const {
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    SlashCommandSubcommandGroupBuilder,
    ChatInputCommandInteraction,
    Client,

} = require("discord.js");

let games = new Map();
let woordgues = new Map();

const db = require("../../../db/woord");
const fishuser = require("../../../db/fishgame/fishuser");
const Akinator = require("discord.js-akinator");

const { AddReward, handleAim, handleShoot, startGame } = require("../../functions/8ball");
const { handle4OpeenrijStart } = require("../../functions/vieropeenrij");

const sub_numbergues = new SlashCommandSubcommandBuilder()
    .setName("numbergues")
    .setDescription("Krijg een nummer om te raden");

const sub_woordgues = new SlashCommandSubcommandBuilder()
    .setName("woordgues")
    .setDescription("Krijg een woord om te raden");

const sub_rps = new SlashCommandSubcommandBuilder()
    .setName("steenpapierschaar")
    .setDescription("Steen Papier Schaar")
    .addStringOption(option =>
        option.setName("keuze")
            .setDescription("Jouw keuze")
            .setRequired(true)
            .addChoices(
                { name: "Steen", value: "steen" },
                { name: "Papier", value: "papier" },
                { name: "Schaar", value: "schaar" }
            )
    );

const group_gues = new SlashCommandSubcommandGroupBuilder()
    .setName("gues")
    .setDescription("Alle gues games")
    .addSubcommand(sub_numbergues)
    .addSubcommand(sub_woordgues);

const sub_start = new SlashCommandSubcommandBuilder()
    .setName('start')
    .setDescription('Start een 8 Ball Pool spel')
    .addUserOption(option =>
        option.setName('tegenstander')
            .setDescription('De tegenstander')
            .setRequired(true)
    );

const sub_aim = new SlashCommandSubcommandBuilder()
    .setName('aim')
    .setDescription('Richt op een specifieke bal in het 8 Ball Pool spel')
    .addIntegerOption(option =>
        option.setName('bal')
            .setDescription('Het nummer van de bal om op te richten (1-15)')
            .setRequired(true)
    );

const sub_shoot = new SlashCommandSubcommandBuilder()
    .setName('shoot')
    .setDescription('Schiet de gerichte bal in het 8 Ball Pool spel');

const sub_akinator = new SlashCommandSubcommandBuilder()
    .setName("akinator")
    .setDescription("Akinator");

const group_achtball = new SlashCommandSubcommandGroupBuilder()
    .setName("8ball")
    .setDescription("8 Ball pool")
    .addSubcommand(sub_start)
    .addSubcommand(sub_aim)
    .addSubcommand(sub_shoot);

const sub_truthordare = new SlashCommandSubcommandBuilder()
    .setName("tod")
    .setDescription("Truth Or Dare (ENGELS!)")
    .addStringOption(option =>
        option.setName("tod")
            .setDescription("Jouw keuze")
            .addChoices(
                { name: 'Truth', value: 'truth' },
                { name: 'Dare', value: 'dare' },
            )
            .setRequired(true)
    );

const sub_quotable = new SlashCommandSubcommandBuilder()
    .setName("quotes")
    .setDescription("ENGELS!");

const sub_fish = new SlashCommandSubcommandBuilder()
    .setName("vis")
    .setDescription("Vissen!");

const sub_inv = new SlashCommandSubcommandBuilder()
    .setName("vis_inventory")
    .setDescription("Jouw vis collectie!");

const group_vissen = new SlashCommandSubcommandGroupBuilder()
    .setName("vissen")
    .setDescription("Vis Game")
    .addSubcommand(sub_fish)
    .addSubcommand(sub_inv);



const sub_4opeenrij_start = new SlashCommandSubcommandBuilder()
    .setName("4opeenrij_start")
    .setDescription("4 Op een rij")
    .addUserOption(option =>
        option.setName('tegenstander')
            .setDescription('De tegenstander')
            .setRequired(true)
    );

const group_overig = new SlashCommandSubcommandGroupBuilder()
    .setName("overig")
    .setDescription("Overige games")
    .addSubcommand(sub_rps)
    .addSubcommand(sub_akinator)
    .addSubcommand(sub_truthordare)
    .addSubcommand(sub_quotable);

const group_vieropeenrij = new SlashCommandSubcommandGroupBuilder()
    .setName("vieropeenrij")
    .setDescription("Vier op een rij")
    .addSubcommand(sub_4opeenrij_start)

const command = new SlashCommandBuilder()
    .setName('game')
    .setDescription('Games!')
    .setDMPermission(false)
    .addSubcommandGroup(group_gues)
    .addSubcommandGroup(group_overig)
    .addSubcommandGroup(group_achtball)
    .addSubcommandGroup(group_vissen)
    .addSubcommandGroup(group_vieropeenrij);

/**
 * @param {Client} client
 * @param {ChatInputCommandInteraction} interaction
 */
async function execute(client, interaction) {
    const subcommando = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    if (subcommando === "numbergues") {
        await handleNumberGuess(interaction, userId);
    } else if (subcommando === 'woordgues') {
        await handleWoordGuess(interaction, userId);
    } else if (subcommando === "steenpapierschaar") {
        await handleRPS(interaction, userId);
    } else if (subcommando === 'start') {
        await startGame(interaction);
    } else if (subcommando === 'aim') {
        await handleAim(interaction);
    } else if (subcommando === 'shoot') {
        await handleShoot(interaction);
    } else if (subcommando === "akinator") {
        await handleAkinator(interaction, client);
    } else if (subcommando === 'tod') {
        await handleTruthOrDare(interaction);
    } else if (subcommando === "quotes") {
        await handleQuotes(interaction);
    } else if (subcommando === "vis") {
        await VangVis(interaction);
    } else if (subcommando === "vis_inventory") {
        await GetFishInv(interaction);
    } else if (subcommando === "4opeenrij_start") {
        await handle4OpeenrijStart(interaction);
    }

  
}

async function handleNumberGuess(interaction, userId) {
    if (games.has(userId)) {
        return interaction.reply({ content: 'Je hebt al een lopende game!', ephemeral: true });
    }

    const numberToGuess = Math.floor(Math.random() * 100) + 1;
    games.set(userId, { numberToGuess, attempts: 0 });

    await interaction.reply({ content: 'Ik heb een nummer in mijn hoofd! Probeer het te raden in de chat.', ephemeral: true });

    const filter = response => response.author.id === userId && !isNaN(response.content);
    const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

    collector.on('collect', async response => {
        const guess = parseInt(response.content, 10);
        const game = games.get(userId);
        game.attempts++;

        if (guess === game.numberToGuess) {
            await response.reply(`Gefeliciteerd! Je hebt het nummer geraden in ${game.attempts} pogingen.`);
            games.delete(userId);
            collector.stop();
        } else if (guess < game.numberToGuess) {
            await response.reply('Hoger!');
        } else {
            await response.reply('Lager!');
        }
    });

    collector.on('end', collected => {
        if (games.has(userId)) {
            interaction.followUp({ content: 'Tijd is om! Het nummer was ' + games.get(userId).numberToGuess, ephemeral: true });
            games.delete(userId);
        }
    });
}

async function handleWoordGuess(interaction, userId) {
    if (woordgues.has(userId)) {
        return interaction.reply({ content: 'Je hebt al een lopende game!', ephemeral: true });
    }

    const randomWord = await db.getRandomWord();
    const hiddenWord = randomWord.split('').map(() => '_').join(' ');

    woordgues.set(userId, { randomWord, hiddenWord, attempts: 0 });

    await interaction.reply({ content: `Raad het woord: ${hiddenWord}`, ephemeral: true });

    const filter = response => response.author.id === userId;
    const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

    collector.on('collect', async response => {
        const guess = response.content.toLowerCase();
        const game = woordgues.get(userId);
        game.attempts++;

        if (guess === game.randomWord) {
            await response.reply(`Gefeliciteerd! Je hebt het woord geraden in ${game.attempts} pogingen.`);
            woordgues.delete(userId);
            collector.stop();
        } else {
            let newHiddenWord = '';
            for (let i = 0; i < game.randomWord.length; i++) {
                newHiddenWord += guess.includes(game.randomWord[i]) ? game.randomWord[i] : game.hiddenWord[i * 2];
                newHiddenWord += ' ';
            }
            game.hiddenWord = newHiddenWord.trim();
            await response.reply(`Probeer het opnieuw: ${game.hiddenWord}`);
        }
    });

    collector.on('end', collected => {
        if (woordgues.has(userId)) {
            interaction.followUp({ content: 'Tijd is om! Het woord was ' + woordgues.get(userId).randomWord, ephemeral: true });
            woordgues.delete(userId);
        }
    });
}

async function handleRPS(interaction, userId) {
    const userChoice = interaction.options.getString("keuze");
    const choices = ['steen', 'papier', 'schaar'];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    let result = '';
    if (userChoice === botChoice) {
        result = 'Gelijkspel!';
    } else if (
        (userChoice === 'steen' && botChoice === 'schaar') ||
        (userChoice === 'papier' && botChoice === 'steen') ||
        (userChoice === 'schaar' && botChoice === 'papier')
    ) {
        result = 'Je hebt gewonnen!';
    } else {
        result = 'Je hebt verloren!';
    }

    await interaction.reply(`Jij koos: ${userChoice}\nBot koos: ${botChoice}\nResultaat: ${result}`);
}

async function handleAkinator(interaction, client) {
    await Akinator(interaction, client, "nl");
}

async function handleTruthOrDare(interaction) {
    const choice = interaction.options.getString('tod');
    const url = `https://api.truthordarebot.xyz/v1/${choice}`;

    const response = await fetch(url);
    const data = await response.json();

    await interaction.reply(data.question);
}

async function handleQuotes(interaction) {
    const url = 'https://api.quotable.io/random';

    const response = await fetch(url);
    const data = await response.json();

    await interaction.reply(`"${data.content}"\n\n- ${data.author}`);
}

async function VangVis(interaction) {
    const userId = interaction.user.id;
    const fish = await fishuser.catchFish(userId);

    await interaction.reply(`Je hebt een ${fish.name} gevangen!`);
}

async function GetFishInv(interaction) {
    const userId = interaction.user.id;
    const inventory = await fishuser.getInventory(userId);

    if (inventory.length === 0) {
        await interaction.reply('Je hebt geen vissen gevangen.');
    } else {
        const fishList = inventory.map(fish => `${fish.name} (${fish.amount})`).join('\n');
        await interaction.reply(`Jouw vissen:\n${fishList}`);
    }
}



module.exports = {catagory: "Games", data: command, execute };

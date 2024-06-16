const { SlashCommandBuilder, SlashCommandSubcommandBuilder, EmbedBuilder, SlashCommandSubcommandGroupBuilder } = require("discord.js");
let games = new Map();
let woordgues = new Map();
const gameSessions = new Map()

const db = require("../../../db/woord");
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

const group_overig = new SlashCommandSubcommandGroupBuilder()
    .setName("overig")
    .setDescription("Overige games")
    .addSubcommand(sub_rps);

const sub_start = new SlashCommandSubcommandBuilder()
.setName('start')
.setDescription('Start een 8 Ball Pool spel')
.addUserOption(option =>
    option.setName('tegenstander')
        .setDescription('De tegenstander')
        .setRequired(true));

const sub_aim = new SlashCommandSubcommandBuilder()
.setName('aim')
.setDescription('Richt op een specifieke bal in het 8 Ball Pool spel')
.addIntegerOption(option =>
    option.setName('bal')
        .setDescription('Het nummer van de bal om op te richten (1-15)')
        .setRequired(true));

const sub_shoot = new SlashCommandSubcommandBuilder()
.setName('shoot')
.setDescription('Schiet de gerichte bal in het 8 Ball Pool spel');

const group_achtball = new SlashCommandSubcommandGroupBuilder()
.setName("8ball")
.setDescription("8 Ball pool")
.addSubcommand(sub_start)
.addSubcommand(sub_aim)
.addSubcommand(sub_shoot);

const command = new SlashCommandBuilder()
    .setName('game')
    .setDescription('Games!')
    .addSubcommandGroup(group_gues)
    .addSubcommandGroup(group_overig)
    .addSubcommandGroup(group_achtball);

module.exports = {
    catagory: "Games",
    data: command,
    async execute(client, interaction) {
        const subcommando = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        if (subcommando === "numbergues") {
            if (games.has(userId)) {
                return interaction.reply({ content: 'Je hebt al een lopende game!', ephemeral: true });
            }

            const numberToGuess = Math.floor(Math.random() * 100) + 1;
            games.set(userId, { numberToGuess, attempts: 0 });

            await interaction.reply({ content: 'Ik heb een nummer in mijn hoofd! Probeer het te raden in de chat.', ephemeral: true });

            const filter = response => {
                return response.author.id === userId && !isNaN(response.content);
            };
            const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

            collector.on('collect', async response => {
                const guess = parseInt(response.content, 10);
                const game = games.get(userId);
                game.attempts++;

                if (game.attempts > 5) {
                    await response.reply({ content: `Teveel pogingen. Het te raden nummer was ${game.numberToGuess}. Probeer opnieuw met /game numbergues.`, ephemeral: true });
                    games.delete(userId);
                    collector.stop();
                } else if (guess === game.numberToGuess) {
                    await response.reply({ content: `Gefeliciteerd! Je hebt ${game.numberToGuess} geraden in ${game.attempts} pogingen. Je hebt €10 gewonnen!`, ephemeral: true });
                    AddReward(userId, 10)
                    games.delete(userId);
                    collector.stop();
                } else if (guess < game.numberToGuess) {
                    await response.reply({ content: 'Hoger!', ephemeral: true });
                } else {
                    await response.reply({ content: 'Lager!', ephemeral: true });
                }
            });

            collector.on('end', collected => {
                if (games.has(userId)) {
                    interaction.channel.send('Tijd is over. Probeer het opnieuw.', { ephemeral: true });
                    games.delete(userId);
                }
            });

        } else if (subcommando === 'woordgues') {
            if (woordgues.has(userId)) {
                return interaction.reply({ content: 'Je hebt al een lopende game!', ephemeral: true });
            } else {
                start();
            }

            const GAME_MODES = ['Anagram', 'Letter Verlies'];

            function getRandomGameMode() {
                const randomIndex = Math.floor(Math.random() * GAME_MODES.length);
                return GAME_MODES[randomIndex];
            }

            function loseLetter(word) {
                const randomIndex = Math.floor(Math.random() * word.length);
                const lostLetter = word[randomIndex];
                const updatedWord = word.substring(0, randomIndex) + '_' + word.substring(randomIndex + 1);
                return { updatedWord, lostLetter };
            }

            async function start() {
                const count = await db.countDocuments();
                if (count === 0 || count === 1) {
                    return interaction.reply("Niet genoeg woorden in de database om te raden. Neem contact op met staff als dit vaker gebeurt");
                }
                const index = Math.floor(Math.random() * count);
                const allDocuments = await db.collection.find({}).toArray();
                const word = allDocuments[index].woord;

                const gameMode = getRandomGameMode();

                let gameModeLogic;
                if (gameMode === 'Anagram') {
                    gameModeLogic = word.split('').sort(() => Math.random() - 0.5).join('');
                } else if (gameMode === 'Letter Verlies') {
                    const { updatedWord } = loseLetter(word);
                    gameModeLogic = updatedWord;
                }

                const embed = new EmbedBuilder()
                    .setTitle('Raad het Woord')
                    .setDescription(`Het te raden woord is: **${gameModeLogic}**`)
                    .addFields(
                        { name: 'Acties', value: 'Reageer op dit bericht met jouw antwoord. Je hebt 5 pogingen' },
                        { name: "Gamemode", value: ` **${gameMode}**` }
                    );
                woordgues.set(userId, { word, attempts: 0 });
                interaction.reply({ embeds: [embed], ephemeral: true });
                return word;
            }

            const filter = response => {
                return response.author.id === userId;
            };
            const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

            collector.on('collect', async response => {
                const guess = response.content;
                const game = woordgues.get(userId);

                if (game.attempts > 5) {
                    await response.reply({ content: `Teveel pogingen. Het woord was ${game.word}. Probeer opnieuw met /game woordgues.`, ephemeral: true });
                    woordgues.delete(userId);
                    collector.stop();
                }
                game.attempts++;

                if (guess === game.word) {
                    await response.reply({ content: `Gefeliciteerd! Je hebt ${game.word} geraden in ${game.attempts} pogingen. Je hebt €50 gewonnen!`, ephemeral: true });
                    AddReward(userId, 50)
                    woordgues.delete(userId);
                    collector.stop();
                }
            });

            collector.on('end', collected => {
                if (woordgues.has(userId)) {
                    interaction.channel.send('Tijd is over. Probeer het opnieuw.', { ephemeral: true });
                    woordgues.delete(userId);
                }
            });

        } else if (subcommando === "steenpapierschaar") {
            let botChoice;
            const userResponse = interaction.options.getString("keuze");
            let choices = ['steen', 'papier', 'schaar'];

            function loadBotChoice() {
                botChoice = choices[Math.floor(Math.random() * choices.length)];
            }
            loadBotChoice();

            let result = '';
            if (userResponse === botChoice) {
                result = "Het is een gelijkspel!";
            } else if (
                (userResponse === "steen" && botChoice === "schaar") ||
                (userResponse === "papier" && botChoice === "steen") ||
                (userResponse === "schaar" && botChoice === "papier")
            ) {
                result = 'Je hebt €10 gewonnen!';
                AddReward(userId, 10)

            } else {
                result = "Je hebt verloren...";
            }

            await interaction.reply({ content: `Jij koos ${userResponse}, ik koos ${botChoice}. ${result}`, ephemeral: true });

        } else if (subcommando === 'start') {
            await startGame(interaction);
        } else if (subcommando === 'aim') {
            await handleAim(interaction);
        } else if (subcommando === 'shoot') {
            await handleShoot(interaction);
        }
    },
};

async function startGame(interaction) {
    const speler1 = interaction.user;
    const speler2 = interaction.options.getUser('tegenstander');
    const gameId = getGameId(speler1.id, speler2.id);

    if (gameSessions.has(gameId)) {
        return interaction.reply(`Er is al een spel gaande tussen ${speler1.username} en ${speler2.username}.`);
    }

    await interaction.reply(`Het spel is gestart tussen ${speler1.username} en ${speler2.username}!`);

    gameSessions.set(gameId, {
        player1: speler1,
        player2: speler2,
        currentPlayer: speler1,
        aimedBall: null,
        player1Balls: [],
        player2Balls: [],
        ballAssignment: false,
        balls: Array.from({ length: 15 }, (_, i) => ({ id: i + 1, pocketed: false, position: [Math.floor(Math.random() * 8), Math.floor(Math.random() * 8)] })),
    });

    await sendGameBoard(interaction.channel, gameId);
}

async function handleAim(interaction) {
    const userId = interaction.user.id;
    const gameId = [...gameSessions.keys()].find(id => id.includes(userId));
    const game = gameSessions.get(gameId);

    if (!game) {
        return interaction.reply({ content: 'Geen spel gevonden tussen jou en de tegenstander.', ephemeral: true });
    }

    if (interaction.user.id !== game.currentPlayer.id) {
        console.log(game);
        return interaction.reply({ content: 'Het is niet jouw beurt!', ephemeral: true });
    }

    const aimedBall = interaction.options.getInteger('bal');
    if (aimedBall < 1 || aimedBall > 15) {
        return interaction.reply({ content: 'Ongeldig ballnummer. Kies een bal tussen 1 en 15.', ephemeral: true });
    }

    game.aimedBall = aimedBall;

    await interaction.reply({ content: `Je hebt gericht op bal ${aimedBall}. Nu kun je schieten!` });
}

async function handleShoot(interaction) {
    const userId = interaction.user.id;
    const gameId = [...gameSessions.keys()].find(id => id.includes(userId));
    const game = gameSessions.get(gameId);

    if (!game) {
        return interaction.reply({ content: 'Geen spel gevonden tussen jou en de tegenstander.', ephemeral: true });
    }
    
    if (interaction.user.id !== game.currentPlayer.id) {
        return interaction.reply({ content: 'Het is niet jouw beurt!', ephemeral: true });
    }

    if (!game.aimedBall) {
        return interaction.reply({ content: 'Je hebt nog niet gericht. Gebruik /game 8ball aim om te richten.', ephemeral: true });
    }
    const aimedBall = game.aimedBall;
    const isPlayer1Turn = game.currentPlayer.id === game.player1.id;
    const playerBalls = isPlayer1Turn ? game.player1Balls : game.player2Balls;

    if (game.ballAssignment && !playerBalls.includes(aimedBall) && aimedBall !== 8) {
        console.log(playerBalls);
        game.aimedBall = null;
        game.currentPlayer = game.currentPlayer.id === game.player1.id ? game.player2 : game.player1;
        return interaction.reply({ content: `Je mag alleen je eigen ballen (${playerBalls}) potten! De beurt gaar over naar de tegenstander` });
    }


    const Change = kans()
    if (Change === false) {
        game.aimedBall = null;
        game.currentPlayer = game.currentPlayer.id === game.player1.id ? game.player2 : game.player1;
        await sendGameBoard(interaction.channel, gameId);
        return await interaction.reply({ content: `Je hebt bal ${aimedBall} geschoten en gemist!` });
    }
    const ballIndex = game.balls.findIndex(ball => ball.id === aimedBall && !ball.pocketed);

    if (ballIndex >= 0) {
        game.balls[ballIndex].pocketed = true;
    }

    if (!game.ballAssignment) {
        if (aimedBall <= 7) {
            game.player1Balls = [1, 2, 3, 4, 5, 6, 7];
            game.player2Balls = [9, 10, 11, 12, 13, 14, 15];
        } else {
            game.player1Balls = [9, 10, 11, 12, 13, 14, 15];
            game.player2Balls = [1, 2, 3, 4, 5, 6, 7];
        }
        game.ballAssignment = true;
        game.aimedBall = null;
         await interaction.reply({ content: `${game.currentPlayer.username} heeft ${aimedBall <= 7 ? 'solids' : 'stripes'} gekozen! De beurt gaat naar de tegenstander` });0
         return game.currentPlayer = game.currentPlayer.id === game.player1.id ? game.player2 : game.player1;
    }
    console.log(`Index: ${ballIndex}`);
   
    CheckWinner(game, gameSessions, ballIndex, interaction, gameId)


    await interaction.reply({ content: `Je hebt bal ${aimedBall} geschoten en geraakt!` });
    await sendGameBoard(interaction.channel, gameId);
}

async function sendGameBoard(channel, gameId) {
    const game = gameSessions.get(gameId);
    if (!game) return;

    const board = generateBoard(game.balls);
    const ballsStatus = game.balls.map(ball => ball.pocketed ? `Bal ${ball.id}: In de pocket` : `Bal ${ball.id}: Op de tafel`).join('\n');

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('8 Ball Pool Game')
        .addFields(
            {name: "Speler aan de beurt", value: game.currentPlayer.username},
            {name: "Ball Status", value: ballsStatus},
            {name: "Speelbord", value: board},
        )
      

    await channel.send({ embeds: [embed] });
}


function generateBoard(balls) {
    const size = 8;
    let board = Array(size).fill().map(() => Array(size).fill(' '));
    balls.forEach(ball => {
        if (!ball.pocketed) {
            const [x, y] = ball.position;
            board[y][x] = ball.id;
        }
    });

    let boardStr = '```\n';
    boardStr += '  0 1 2 3 4 5 6 7\n';
    boardStr += ' +----------------\n';
    board.forEach((row, i) => {
        boardStr += `${i}| ${row.join(' ')}\n`;
    });
    boardStr += '```';

    return boardStr;
}

function getGameId(player1Id, player2Id) {
    return [player1Id, player2Id].sort().join('-');
}

function kans() {
    let kans
    const kansberkening =  Math.floor(Math.random() * 3)
    if (kansberkening === 1 || kansberkening === 3 || kansberkening === 0) {
        kans = true
    } else if (kansberkening === 2) {
        kans = false
    }
    console.log(`Berekening: ${kansberkening}`);
    console.log(`Kans: ${kans}`);
    return kans
}

async function AddReward(id, reward) {
const rewardSchema = require("../../../db/money").User
const rewards = await rewardSchema.findOne({userId: id}).exec()
if (!rewards) {
    return interaction.reply(`<@${id}> Heeft nog geen bankrekening. Maak er een aan met </createbank:1239597214205214821>`)
}
rewards.cash = rewards.cash + reward
rewards.save()
}

function CheckWinner(game, gameSessions, ballIndex, interaction, gameId) {
    if (game.balls.length === 1 && game.balls[0].id === 8) {
        console.log(`Winner: ${game.currentPlayer}`);
        gameSessions.delete(gameId)
        AddReward(game.currentPlayer.id, 100)
        return interaction.reply(`De 8ste bal moet als laatste in de put belanden! Dit heeft ${game.currentPlayer} gedaan hij is daarom de winnaar. ${game.currentPlayer} Heeft €100 gewonnen`)
    } else if (game.balls.length > 1 && game.balls[ballIndex].id === 8) {
        if (game.currentPlayer === game.player1) {
            console.log(`Winner: ${game.player2}`);
            gameSessions.delete(gameId)
            AddReward(game.player2.id, 100)
            return interaction.reply(`De 8ste bal moet als laatste in de put belanden! Winnaar: ${game.player2}. ${game.player2} Heeft €100 gewonnen`)
        } else if (game.currentPlayer === game.player2) {
            console.log(`Winner: ${game.player1}`);
            gameSessions.delete(gameId)
            AddReward(game.player1.id, 100)
            return interaction.reply(`De 8ste bal moet als laatste in de put belanden! Winnaar: ${game.player1}. ${game.player1} Heeft €100 gewonnen`)
        }
    } else {
        game.aimedBall = null;
        game.currentPlayer = game.currentPlayer.id === game.player1.id ? game.player2 : game.player1;
    }
}
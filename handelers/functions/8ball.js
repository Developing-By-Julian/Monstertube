const gameSessions = new Map()
const { SlashCommandBuilder, SlashCommandSubcommandBuilder, EmbedBuilder, SlashCommandSubcommandGroupBuilder, ChatInputCommandInteraction, Embed } = require("discord.js");

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
        initialized: false
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
    const embed = new EmbedBuilder()
    // Place balls in initial triangle formation if it's the start of the game
    if (!game.initialized) {
        initializeTriangleFormation(game.balls);
        game.initialized = true;
        embed.addFields({name: "Start", value: "START! De game is net begonnen. Open het spel"})
    }

    const board = generateBoard(game.balls);
    const ballsStatus = game.balls.map(ball => ball.pocketed ? `Bal ${ball.id}: In de pocket` : `Bal ${ball.id}: Op de tafel`).join('\n');
        
    embed.setColor('#0099ff')
    embed.setTitle('8 Ball Pool Game')
    embed.addFields(
            {name: "Speler aan de beurt", value: game.currentPlayer.username},
            {name: "Speelbord", value: board},
        );
    if (game.balls.length === 14) {
        embed.addFields(
            {name: "Ball Status", value: ballsStatus},
        )
    }
      

    await channel.send({ embeds: [embed] });
}

function initializeTriangleFormation(balls) {
    const trianglePositions = [
        [3, 0], // Top of the triangle
        [2, 1], [4, 1],
        [1, 2], [3, 2], [5, 2],
        [0, 3], [2, 3], [4, 3], [6, 3],
        [1, 4], [3, 4], [5, 4],
        [2, 5], [4, 5],
        [3, 6]
    ];

    for (let i = 0; i < balls.length; i++) {
        balls[i].position = trianglePositions[i];
    }
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

async function AddReward(id, reward, interaction) {
const rewardSchema = require("../../../db/money").User
const rewards = await rewardSchema.findOne({userId: id}).exec()
if (!rewards) {
    interaction.reply(`<@${id}> Heeft nog geen bankrekening. Maak er een aan met </createbank:1239597214205214821>`)
    return false
    
}
rewards.cash = rewards.cash + reward
rewards.save()
return true
}

function CheckWinner(game, gameSessions, ballIndex, interaction, gameId) {
    if (game.balls.length === 1 && game.balls[0].id === 8) {
        console.log(`Winner: ${game.currentPlayer}`);
        gameSessions.delete(gameId)
        const reward = AddReward(game.currentPlayer.id, 100, interaction)
        if (reward) {
            return interaction.reply(`De 8ste bal moet als laatste in de put belanden! Dit heeft ${game.currentPlayer} gedaan hij is daarom de winnaar. ${game.currentPlayer} Heeft €100 gewonnen`)

        }
    } else if (game.balls.length > 1 && game.balls[ballIndex].id === 8) {
        if (game.currentPlayer === game.player1) {
            console.log(`Winner: ${game.player2}`);
            gameSessions.delete(gameId)
            const reward = AddReward(game.player2.id, 100, interaction)
            if (reward) {
                return interaction.reply(`De 8ste bal moet als laatste in de put belanden! Winnaar: ${game.player2}. ${game.player2} Heeft €100 gewonnen`)
            }
        } else if (game.currentPlayer === game.player2) {
            console.log(`Winner: ${game.player1}`);
            gameSessions.delete(gameId)
            const reward = AddReward(game.player1.id, 100, interaction)
            if (reward) {
                return interaction.reply(`De 8ste bal moet als laatste in de put belanden! Winnaar: ${game.player1}. ${game.player1} Heeft €100 gewonnen`)
            }
        }
    } else {
        game.aimedBall = null;
        game.currentPlayer = game.currentPlayer.id === game.player1.id ? game.player2 : game.player1;
    }
}

module.exports = {AddReward, handleAim, handleShoot, startGame}
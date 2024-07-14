const boardWidth = 7;
const boardHeight = 6;
let board = [];
const {
    ButtonBuilder,
    ActionRowBuilder,
} = require("discord.js")
const vieropeenrijmap = new Map();

function initializeBoard() {
    board = Array.from(Array(boardWidth), () => new Array(boardHeight).fill(null));

    return board
}
function formatBoard() {
    let str = '';
    for (let row = boardHeight - 1; row >= 0; row--) {
        for (let col = 0; col < boardWidth; col++) {
            str += board[col][row] === null ? '⚪️ ' : board[col][row] === 'X' ? '🔴 ' : '🔵 ';
        }
        str += '\n';
    }
    return str;
}

function dropDisc(board, col, player) {
    if (col === undefined || !Array.isArray(board[col])) {
        console.error(`Invalid column index: ${col}`);
        return false;
    }
    for (let row = 0; row < boardHeight; row++) {
        if (board[col][row] === null) {
            board[col][row] = player;
            return true;
        }
    }
    return false; // Kolom is vol
}

function checkWin(player) {
    for (let row = 0; row < boardHeight; row++) {
        for (let col = 0; col <= boardWidth - 4; col++) {
            if (board[col][row] === player &&
                board[col + 1][row] === player &&
                board[col + 2][row] === player &&
                board[col + 3][row] === player) {
                return true;
            }
        }
    }

    for (let col = 0; col < boardWidth; col++) {
        for (let row = 0; row <= boardHeight - 4; row++) {
            if (board[col][row] === player &&
                board[col][row + 1] === player &&
                board[col][row + 2] === player &&
                board[col][row + 3] === player) {
                return true;
            }
        }
    }

    for (let col = 0; col <= boardWidth - 4; col++) {
        for (let row = 0; row <= boardHeight - 4; row++) {
            if (board[col][row] === player &&
                board[col + 1][row + 1] === player &&
                board[col + 2][row + 2] === player &&
                board[col + 3][row + 3] === player) {
                return true;
            }
        }
    }

    for (let col = 0; col <= boardWidth - 4; col++) {
        for (let row = 3; row < boardHeight; row++) {
            if (board[col][row] === player &&
                board[col + 1][row - 1] === player &&
                board[col + 2][row - 2] === player &&
                board[col + 3][row - 3] === player) {
                return true;
            }
        }
    }

    return false;
}
async function handle4OpeenrijPlay(interaction) {
    const userId = interaction.user.id;
    const currentPlayerId = userId;
    const currentPlayerData = vieropeenrijmap.get(currentPlayerId);

    // Controleer of de speler een lopend spel heeft
    if (!currentPlayerData) {
        return interaction.reply({ content: 'Je hebt geen lopend spel.', ephemeral: true });
    }

    const opponentId = currentPlayerData.opponentId;
    const opponentData = vieropeenrijmap.get(opponentId);

    // Controleer of het de beurt van de speler is
    if (currentPlayerData.turn !== true) {
        return interaction.reply({ content: 'Het is niet jouw beurt', ephemeral: true });
    }

    const column = parseInt(interaction.customId.split('_')[1]);
    const board = currentPlayerData.board;

    const result = dropDisc(board, column, userId);
    const formattedBoard = formatBoard(board);

    if (result === 'win') {
        vieropeenrijmap.delete(userId);
        vieropeenrijmap.delete(opponentId);
        await interaction.update({
            content: `Gefeliciteerd! Je hebt gewonnen!\n${formattedBoard}`,
            components: [],
        });
    } else if (result === 'draw') {
        vieropeenrijmap.delete(userId);
        vieropeenrijmap.delete(opponentId);
        await interaction.update({
            content: `Het is een gelijkspel!\n${formattedBoard}`,
            components: [],
        });
    } else {
        // Na een succesvolle zet, wissel de beurt
        currentPlayerData.turn = false;
        opponentData.turn = true;
        
        await interaction.update({
            content: `De huidige stand:\n${formattedBoard}`,
            components: createBoardButtons(board),
        });
    }
}


async function handle4OpeenrijStart(interaction) {
    const userId = interaction.user.id;
    const opponent = interaction.options.getUser('tegenstander');

    // Controleer of een van de spelers al een lopend spel heeft
    if (vieropeenrijmap.has(userId) || vieropeenrijmap.has(opponent.id)) {
        return interaction.reply({ content: 'Een van de spelers heeft al een lopend spel.', ephemeral: true });
    }

    const newBoard = initializeBoard(boardWidth, boardHeight);
    vieropeenrijmap.set(userId, { board: newBoard, opponentId: opponent.id, turn: true });
    vieropeenrijmap.set(opponent.id, { board: newBoard, opponentId: userId, turn: false });

    await interaction.reply({
        content: `Het spel is gestart! Jij en ${opponent.username} kunnen nu spelen.\n${formatBoard(newBoard)}`,
        components: createBoardButtons(newBoard),
    });
}

function createBoardButtons(board) {
    const rows = [];
    const buttonsPerRow = 5;

    for (let i = 0; i < board[0].length; i += buttonsPerRow) {
        const row = new ActionRowBuilder();
        for (let j = i; j < i + buttonsPerRow && j < board[0].length; j++) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`column_${j}`)
                    .setLabel((j + 1).toString())
                    .setStyle(1)
            );
        }
        rows.push(row);
    }

    return rows;
}
module.exports = {board, boardHeight, boardWidth, checkWin, dropDisc, formatBoard, initializeBoard, createBoardButtons, handle4OpeenrijPlay, handle4OpeenrijStart}

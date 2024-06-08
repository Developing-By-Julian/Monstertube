const {SlashCommandBuilder, EmbedBuilder} = require("discord.js")
let games = new Map()
module.exports = {
	catagory: "Games",
	data: new SlashCommandBuilder()
		.setName('numbergues')
		.setDescription('Numbergues!')
        ,
	async execute(client, interaction) {


        console.log('Number guess command started');
        const userId = interaction.user.id;

        if (games.has(userId)) {
            console.log('Game already running for user:', userId);
            return interaction.reply({ content: 'Je hebt al een lopende game!', ephemeral: true });
        }

        const numberToGuess = Math.floor(Math.random() * 100) + 1;
        games.set(userId, { numberToGuess, attempts: 0 });

        await interaction.reply({ content: 'Ik heb een nummer in mijn hoofd! Probeer het te raden in de chat.', ephemeral: true });
        console.log(`Number to guess: ${numberToGuess}, Games Map:`, games);

        const filter = response => {
            console.log('Message collected in filter:', response.content);
            console.log(response.author.id);
            console.log(userId);
            return response.author.id === userId && !isNaN(response.content);
        };
        const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

        collector.on('collect', async response => {
            console.log('Message collected:', response.content);
            const guess = parseInt(response.content, 10);
            const game = games.get(userId);
            game.attempts++;

            if (guess === game.numberToGuess) {
                await response.reply(`Gefeliciteerd! Je hebt ${game.numberToGuess} geraden in ${game.attempts} pogingen.`);
                games.delete(userId);
                collector.stop();
            } else if (guess < game.numberToGuess) {
                await response.reply('Hoger!');
            } else {
                await response.reply('Lager!');
            }
        });

        collector.on('end', collected => {
            console.log('Collector ended. Collected messages:', collected.size);
            if (games.has(userId)) {
                interaction.channel.send('Tijd is over. Probeer het opnieuw.');
                games.delete(userId);
            }
        });

		
	},
};
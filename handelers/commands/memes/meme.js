const  axios  = require("axios");
const {SlashCommandBuilder, EmbedBuilder} = require("discord.js")
module.exports = {
	catagory: "Memes",
	data: new SlashCommandBuilder()
		.setName('meme')
		.setDescription('Krijg een meme!')
        ,
	async execute(client, interaction) {

        const response = await axios.get('https://meme-api.com/gimme');
        const meme = response.data

        const embed = new EmbedBuilder()
        .setTitle(meme.title)
        .setURL(meme.postLink)
        .setImage(meme.url)
        .setFooter({text: `👍 ${meme.ups} | Author: ${meme.author}`})


        interaction.reply({embeds: [embed]})
		
	},
};
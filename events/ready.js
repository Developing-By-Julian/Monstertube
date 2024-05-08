const { Events, ActivityType } = require('discord.js');
const mongoose = require("mongoose")
const fs = require("fs")
require("dotenv").config()
module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`${client.user.username}, Ready`)
		mongoose.connect(`mongodb+srv://admin:admin@cluster.5rcydhk.mongodb.net/?retryWrites=true&w=majority&appName=cluster`)
			.then(
				console.log("DATABASE CONNECTIE LIGT")


			)
		client.user.setActivity('MONSTERGANG!!', { type: ActivityType.Listening })
	},
};

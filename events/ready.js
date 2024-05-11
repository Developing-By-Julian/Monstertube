const { Events, ActivityType } = require('discord.js');
const mongoose = require("mongoose")
const fs = require("fs")
require("dotenv").config()
module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`✅| ${client.user.username} (Client)`)
		mongoose.connect(`mongodb+srv://admin:admin@cluster.5rcydhk.mongodb.net/?retryWrites=true&w=majority&appName=cluster`)
			.then(
				console.log("✅| Database")


			)
			const activities = [
				{ name: 'MONSTERGANG!!', type: ActivityType.Listening },
				{ name: 'GEMAAKT DOOR JULIANRJC', type: ActivityType.Listening },
			];
		// client.user.setActivity('MONSTERGANG!!', { type: ActivityType.Listening })

		function setRandomActivity() {
			const randomActivity = activities[Math.floor(Math.random() * activities.length)];
			client.user.setActivity(randomActivity.name, { type: randomActivity.type });
		}
	
		// Stel de activiteit in wanneer de bot voor het eerst online komt
		setRandomActivity();
	
		// Wijzig de activiteit elke 30 minuten
		setInterval(setRandomActivity, 1 * 60 * 1000); // 1 minuut in milliseconden
	},
};

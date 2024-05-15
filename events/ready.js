const { Events, ActivityType } = require('discord.js');
const mongoose = require("mongoose")
const client = require("../src/botClient")
const fs = require("fs")
require("dotenv").config()
module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(cloent) {
		console.log(`✅| ${client.user.username} (Client)`)
		console.log(`Bot bevindt zich in ${client.guilds.cache.size} guilds`);
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
		client.user.setPresence({activites: [{name: 'MONSTERGANG'}], status: "online"})

		// Stel de activiteit in wanneer de bot voor het eerst online komt
		setRandomActivity();
	
		// Wijzig de activiteit elke 30 minuten
		setInterval(setRandomActivity, 1 * 60 * 1000); // 1 minuut in milliseconden
	},
};

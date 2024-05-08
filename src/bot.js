const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds] })
require("dotenv").config()
const mongoose = require("mongoose")
const {DailyReward,User} = require("../db/daily")


client.commands = new Collection();
client.events = new Collection()
client.functions = new Collection()
const foldersPath = path.join(__dirname, '../commands');
const commandFolders = fs.readdirSync(foldersPath);
const commandsloaded = []

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			commandsloaded.push({
				name: command.data.name,
				description: command.data.description,
				filePath: filePath
			})
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WAARSCHUWING] De command op ${filePath} mist een "data" en/of "execute" tag.`);
		}
	}
}console.log("De volgende commands zijn geladen: ")

console.table(commandsloaded);
const loaded_events = []

const eventsPath = path.join(__dirname, '../events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (!event.name || !event.execute) {
		console.log( `Event niet geladen: ${file}`)
		continue;
	}
	loaded_events.push({
		name: event.name ,
		filePath: filePath
	})
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
		client.events.set(event.name, event);
	} else {
		client.on(event.name, (...args) => event.execute(...args));
		client.events.set(event.name, event);

	}
}
console.log("De volgende events zijn geladen: ")
console.table(loaded_events);
const loaded_functions = []

const functionsPath = path.join(__dirname, "../functions")
const functionFiles = fs.readdirSync(functionsPath).filter(file => file.endsWith(".js"))

for (const file of functionFiles) {
const filePath = path.join(functionsPath, file)
const functions = require(filePath)
loaded_functions.push({
	name: functions.name,
	filePath: filePath
})
client.functions.set(functions.name, functions)
}
console.log("De volgende functions zijn geladen:");
console.table(loaded_functions)


//Daily Function:

async function claimDaily(member) {
    try {
        const roles = member.roles.cache.map(role => role.id)
        const query = {role: {$in: roles}}
        const rewards = await DailyReward.find(query).toArray()
        if (rewards.length === 0) return false

        let totalReward = rewards.reduce((acc, curr) => acc + curr.reward, 0)
        console.log(`Gebruiker met ID ${member.id} heeft een beloning van ${totalReward} gekregen`);
        return true
    } catch (error) {
        console.error(`Fout bij claimen van daily ${error}`);
        return false
    }
}

// Daily Event:
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'claim_daily') {
        const claimed = await claimDaily(interaction.member);
        if (claimed) {
            interaction.reply({ content: 'Je dagelijkse beloning is geclaimd!', ephemeral: true });
        } else {
            interaction.reply({ content: 'Je hebt je dagelijkse beloning al geclaimd.', ephemeral: true });
        }
    }
});

client.login("MTIzNzc4ODQ5ODA3Mzc0NzUyNw.GH-X6r.IXZd0-ZZqsGNNTGL_ymCHM17pG6nbC6MdpYeaE")

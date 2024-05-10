const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds] })
require("dotenv").config()
const mongoose = require("mongoose")
const {DailyReward,User} = require("../db/money")


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

client.on("debug", console.debug)
client.on("warn", console.warn)

//Daily Function:

async function claimDaily(member) {
    try {
		
		const user = await User.findOne({userId: member.id})
		if (!user) {
			console.log(`MEMBER ID: ${member.id}`);
            const newUser = new User({ userId: member.id, lastClaimed: Date.now(), money: 0 });
            console.log("NO USER");
            await newUser.save(); // Wacht tot de nieuwe gebruiker is opgeslagen
            console.log(`new User: ${newUser}`);
            return true;
		} else if (user && user.lastClaimed && (Date.now() - user.lastClaimed.getTime()) < 86400000) {
			return false
		} else if (user) {
			console.log("USER");

			return true
		}

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
			const roles = interaction.member.roles.cache.map(role => role.id);
			const query = { roleId: { $in: roles } }; // Correct the field name
			const rewards = await DailyReward.find(query).exec(); // Executing the query
					if (rewards.length === 0) return false
			
					let totalReward = rewards.reduce((acc, curr) => acc + curr.reward, 0)
            interaction.reply({ content: 'Je dagelijkse beloning is geclaimd!', ephemeral: true });
			console.log(`Gebruiker met ID ${interaction.member.id} heeft een beloning van ${totalReward} gekregen`);
			const userid = interaction.member.id

			const filter = { userId: userid }; // Filter om het document te selecteren dat moet worden bijgewerkt

			User.findOne(filter)
				.then(user => {
					if (user) {
						// Oude waarde van money
						const oldMoney = user.money || 0;
			
						// Nieuwe waarde van money inclusief de oude waarde en totalReward
						const newMoney = oldMoney + totalReward;
			
						// Bijwerken van het document met de nieuwe waarde van money
						return User.updateOne(filter, { money: newMoney }, { new: true });
					} else {
						console.error(`Gebruiker met ID ${userid} niet gevonden.`);
						return null;
					}
				})
				.catch(error => {
					console.error(`Fout bij het bijwerken van geld voor gebruiker met ID ${userid}: ${error}`);
				});
			User.updateOne({ userId: userid }, { lastClaimed: new Date() });


        } else {
            interaction.reply({ content: 'Je hebt je dagelijkse beloning al geclaimd.', ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN)

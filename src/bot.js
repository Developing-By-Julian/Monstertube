const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds] })
require("dotenv").config()
const mongoose = require("mongoose")
const {DailyReward,User} = require("../db/money")
const express = require("express");
const session = require('express-session');
const bcrypt = require("bcrypt")
const mongoDBStore = require("connect-mongodb-session")(session)
const store = new mongoDBStore({
	uri: "mongodb+srv://admin:admin@cluster.5rcydhk.mongodb.net/?retryWrites=true&w=majority&appName=cluster",
	collection: "sessies"
})
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
				status: "✅",
				name: command.data.name,
				description: command.data.description,
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
		status: "✅",
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

// client.on("debug", console.debug)
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

const app = express()
const bodyParser = require('body-parser');

const loginSchema = new mongoose.Schema({
	username: String,
	password: String
})

const Loginschema = mongoose.model('Login', loginSchema);

app.use(session({
	secret: "MT",
	resave: false,
	saveUninitialized: true,
	store: store
}))

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());app.set("view engine", "ejs")
app.get("/", (req, res) => {
res.render("index")
})
app.get("/login", (req, res) => {
	res.render("login")
})

app.post('/login', async (req, res) => {
    const { username, password, guildid } = req.body;
    const user = await Loginschema.findOne({ username });
	console.log(user);
    if (user && username === user.username && password === user.password) {
        req.session.user = user;
		req.session.guildid = guildid
        res.redirect(`/dashboard?guildid=${guildid}`);
    } else {
        res.redirect('/login');
    }
});

app.get('/dashboard', async (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
		const guild = client.guilds.cache.get(req.query.guildid)
		const roleschema = require("../db/money").DailyReward
		const roles = await roleschema.find({guildId: guild.id})

        res.render('dashboard', {data: { user: req.session.user, guild: guild, roleSetup: roles}});
    }
});
const Config = require("../db/config").Config
app.get('/dashboard/starting-balance', async (req, res) => {
	try {
res.render("startbalans")	
} catch (error) {
	  res.status(500).send(error);
	}
  });
  app.post('/dashboard/starting-balance', async (req, res) => {
	try {
	  const { value } = req.body;
	  const key = "Startingbalance"
	  // Zoek eerst of de configuratie al bestaat
	  const existingConfig = await Config.findOne({ key });
	  console.log(existingConfig);
	  if (existingConfig) {
		console.log(existingConfig);
		// Update de bestaande configuratie
		await Config.updateOne({ key }, { value });
		res.redirect(`/dashboard?guildid=${req.session.guildid}`)


	  } else {
		// Maak een nieuwe configuratie als deze niet bestaat
		const newConfig = new Config({key: key, value: value});
		await newConfig.save();
		res.redirect(`/dashboard?guildid=${req.session.guildid}`)
		console.log(newConfig);

	  }
	} catch (error) {
	  res.status(500).send(error);
	}
  });

  app.get('/dashboard/create-reward', (req, res) => {
	const guildid = req.session.guildid

	const guild = client.guilds.cache.get(guildid)
	const roles = guild.roles.cache.map(role => ({
		name: role.name
	}))
	res.render("createReward", {roles: roles})
});
app.post('/dashboard/create-reward', async (req, res) => {
const guildid = req.session.guildid
const guild = client.guilds.cache.get(guildid)
const {role, value} = req.body

const roleid = guild.roles.cache.find(roles => roles.name === role)

const a = new DailyReward({
	guildId: guildid,
	reward: value,
	roleId: roleid.id,
	roleName: roleid.name
})
a.save().then(
	
	res.redirect(`/dashboard?guildid=${guildid}`)
)


});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen("3000", () => {
	console.log("✅|Dashboard online");
})
client.login(process.env.TOKEN)

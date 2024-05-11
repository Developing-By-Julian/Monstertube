const client = require("./botClient")
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
    if (user && username === user.username && password === user.password) {
        req.session.user = user;
		req.session.guildid = guildid
        res.redirect(`/dashboard?guildid=${guildid}`);
    } else {
        res.redirect('/login');
    }
});
const roleschema = require("../db/money").DailyReward

app.get('/dashboard', async (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
		const guild = client.guilds.cache.get(req.query.guildid)
		const roles = await roleschema.find({guildId: guild.id})

        res.render('dashboard', {data: { user: req.session.user, guild: guild, roleSetup: roles}});
    }
});
const Config = require("../db/config").Config
app.get('/dashboard/starting-balance', async (req, res) => {
	try {
		const find_config = await Config.findOne({key: "Startingbalance"}).then(data => {
			if (!data) {
				return "Geen data gevonden"
			} {
				return data.value
			}
		})

res.render("startbalans", {data: {config: find_config}})
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
	  if (existingConfig) {
		// Update de bestaande configuratie
		await Config.updateOne({ key }, { value });
		res.redirect(`/dashboard?guildid=${req.session.guildid}`)


	  } else {
		// Maak een nieuwe configuratie als deze niet bestaat
		const newConfig = new Config({key: key, value: value});
		await newConfig.save();
		res.redirect(`/dashboard?guildid=${req.session.guildid}`)

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
	res.render("createReward", {data: {roles: roles, session: req.session}})
});
app.post('/dashboard/create-reward', async (req, res) => {
const guildid = req.session.guildid
const guild = client.guilds.cache.get(guildid)
const {role, value} = req.body

const roleid = guild.roles.cache.find(roles => roles.name === role)

const role_F = await roleschema.findOne({roleId: roleid.id}).then(data => {
	return data
})

const rolename = roleid.name
if (role_F) {
	res.render('error', {data: {text: "Role bestaat al", guildid: req.session.guildid}})
	
} else {
	const a = new roleschema({
		guildId: req.session.guildid,
		roleId: roleid.id,
		roleName: rolename,
		reward: value
	})

a.save().then(
	
	res.redirect(`/dashboard?guildid=${guildid}`)
)
}

});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});


module.exports = app
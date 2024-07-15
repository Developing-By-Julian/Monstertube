
//Imports

const client = require("../src/botClient")
require("dotenv").config()
const express = require("express");
const session = require('express-session');
const mongoDBStore = require("connect-mongodb-session")(session)
const bodyParser = require('body-parser');
const path = require("path")
const app = express()

// Router imports 

const router_createreward = require("./routers/reward")
const router_startbalans = require("./routers/startbalans")
const router_index = require("./routers/index")
const router_leaderboard = require("./routers/leaderboard")
const router_joinstats = require("./routers/todayStats")
const router_bannken = require("./routers/bankaccounts")
const router_woord = require("./routers/setup/woord")
const router_discordauth = require("./routers/discordauth")
const router_countingChannel = require("./routers/countingConfig")

// Sessie opslag

const store = new mongoDBStore({
	uri: "mongodb+srv://admin:admin@cluster.5rcydhk.mongodb.net/?retryWrites=true&w=majority&appName=cluster",
	collection: "sessies"
})

// Auth Sessie
app.use(session({
	secret: "MT",
	resave: false,
	saveUninitialized: true,
	store: store
}))

// Bodyparses

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// EJS 

app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs")

//Static

app.use('/static', express.static(path.join(__dirname, 'public')))

// Routers
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.use(router_createreward)  
app.use(router_startbalans)
app.use(router_index)
app.use(router_leaderboard)
app.use(router_joinstats)
app.use(router_bannken)
app.use(router_woord)
app.use(router_discordauth)
app.use(router_countingChannel)
//Export

module.exports = app
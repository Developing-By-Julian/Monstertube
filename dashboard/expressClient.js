
//Imports

const client = require("../src/botClient")
require("dotenv").config()
const express = require("express");
const session = require('express-session');
const mongoDBStore = require("connect-mongodb-session")(session)
const bodyParser = require('body-parser');
const app = express()

// Router imports 

const router_createreward = require("./routers/reward")
const router_startbalans = require("./routers/startbalans")
const router_index = require("./routers/index")
const router_auth = require("./routers/login_uit")

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
app.use(bodyParser.json());app.set("view engine", "ejs")

// Routers

app.use(router_createreward)
app.use(router_startbalans)
app.use(router_auth)
app.use(router_index)

//Export

module.exports = app
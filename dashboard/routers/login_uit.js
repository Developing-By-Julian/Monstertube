const app = require("express").Router()
const mongoose = require("mongoose")
const loginSchema = new mongoose.Schema({
	username: String,
	password: String
})

const Loginschema = mongoose.model('Login', loginSchema);

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


app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = app
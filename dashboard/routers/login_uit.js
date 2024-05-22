const app = require("express").Router()
const mongoose = require("mongoose")
const loginSchema = new mongoose.Schema({
	username: String,
	password: String,
    name: String,
    discordid: String
})
const createToken = require("../../handelers/functions/generateToken")
const TokenSchema = require("../../db/createToken")

const Loginschema = mongoose.model('Login', loginSchema);

app.get("/login", (req, res) => {
	res.render("auth/login")
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await Loginschema.findOne({ username: username });
var guildid
    if (username === "julian@monstertube.nl") {
        guildid = "1233925574070767696"
    } else {
        guildid = "1230258666146365481"
    }
    console.log(guildid);
    if (user && username === user.username && password === user.password) {
        req.session.user = user;
		req.session.guildid = guildid
       res.redirect(`/dashboard`);
    } else {
        res.redirect('/login');
    }
});


app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get("/auth/redirect", async (req, res) => {
    res.render("auth/auth")
})

app.post("/auth/redirect", async (req, res) => {
    const email = req.body.value + '@monstertube.nl'

    const findUser = await Loginschema.findOne({ username: email }).then(data => {return data})
    const client = require("../../src/botClient");
    const guild = client.guilds.cache.get(req.session.guildid);
    console.log(findUser);
    const user = await guild.members.fetch(findUser.discordid);
    console.log(user);
    const msg = await user.send("Ben jij het? Reageer J voor Ja of N voor Nee");
    const collector = msg.channel.createMessageCollector({ time: 60000, max: 1 });
    collector.on("collect", async (message) => {
        const antwoord = message.content.toString();
        if (antwoord.includes("j") || antwoord.includes("J")) {
            const token = await createToken(email);
            res.redirect(`/auth/change?email=${email}&token=${token}`);
        } else {
            res.redirect('/auth/redirect');
        }
    });
});


app.get("/auth/change", async (req, res) => { 
    let Fdata
    const find = await Loginschema.findOne({username: req.query.email }).then(data => {console.log(data); Fdata = data})
    const tokenFind = await TokenSchema.findOne({token: req.query.token}).then(data => {return data})

    if (!tokenFind) {
        res.redirect("/auth/redirect")
    } {
        res.render("auth/password", {data: {find: Fdata, token: tokenFind.token}})
    }
    
})
app.post("/auth/change", async (req, res) => {
const {current_password, new_password, confirm_password} = req.body
const email = req.query.email
console.log(`Email: ${email}`);
let Fdata

const find = await Loginschema.findOne({username: email }).then(data => {console.log(data); Fdata = data})

console.log(Fdata);

if (!Fdata) {
    return res.status(500).send("Geen data gevonden, change ");
}

if (!current_password === Fdata.password) {
    return res.status(500).send("Wachtwoord komt niet overheen met bestaand wachtwoord");
}

if (!new_password === confirm_password) {
    return res.status(500).send("Nieuw wachtwoord komt niet overheen met bevestigings wachtwoord");
}

Loginschema.findOneAndUpdate(
    {username: email},
    {$set: {password: new_password}},
    {new: true}
).then(updated => {
    if (updated) {
        res.status(500).send("Nieuw wachtwoord ingesteld. Je kan deze pagina sluiten");
    } else {
        return res.status(500).send("Geen data gevonden ");
    }
})


const querytoken = req.query.token
TokenSchema.findOneAndDelete({token: querytoken}).then(() => {console.log(`querytoken ${querytoken} verwijderd `)})



})



module.exports = app
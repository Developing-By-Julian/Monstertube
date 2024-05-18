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
    const { username, password } = req.body;
    const user = await Loginschema.findOne({ username: username });
    console.log(user);
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
    res.render("auth")
})

app.post("/auth/redirect", async (req, res) => {
    const email = req.body.value

    res.redirect(`/auth/change?email=${email}`)
})


app.get("/auth/change", async (req, res) => { 
    let Fdata
    const find = await Loginschema.findOne({username: req.query.email }).then(data => {console.log(data); Fdata = data})

        res.render("password", {data: {find: Fdata}})
    
})
app.post("/auth/change", async (req, res) => {
const {current_password, new_password, confirm_password} = req.body
const email = req.query.email
let Fdata

const find = await Loginschema.findOne({username: email }).then(data => {console.log(data); Fdata = data})



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
)
.then(updated => {
    if (updated) {
        res.status(500).send("Nieuw wachtwoord ingesteld");
    } else {
        return res.status(500).send("Geen data gevonden ");
    }
})





})



module.exports = app
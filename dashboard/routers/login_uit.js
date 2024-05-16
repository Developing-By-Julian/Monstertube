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
    const user = await Loginschema.findOne({ username });
var guildid
    if (user.username === "webbeheer") {
        guildid = "1233925574070767696"
    } else if (user.username === "monstertube") {
        guildid = "1230258666146365481"
    }
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

app.get("/auth", (req, res) => {
    res.render("auth")
})
app.post("/auth", (req, res) => {
const {value, code} = req.body
if (code === "1986") {
    console.log(`${code}, Code is goed `);
    res.redirect(`/auth/change?email=${encodeURIComponent(value)}`);
}  else {
    console.log(`${code}, Code is fout `);
     res.redirect("/")
}




})
app.get("/auth/change", (req, res) => { 
        res.render("password")
    
})
app.post("/auth/change", async (req, res) => {
const {value} = req.body
const email = req.query.email

const find = Loginschema.findOne({username: email })
console.log(find);
if (!find) {
    return res.status(500).send("Geen data gevonden ");
} {
   Loginschema.findOneAndUpdate({username: email}, {$set: {password: value}}, {new: true}).then(newuser => console.log(newuser)).finally(res.redirect("/"))
}







})



module.exports = app
const router = require("express").Router()
const client = require("../../src/botClient")

const roleschema = require("../../db/money").DailyReward

router.get('/dashboard', async (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
		const guild = client.guilds.cache.get(req.session.guildid)
		const roles = await roleschema.find({guildId: req.session.guildid})

        res.render('dashboard', {data: { req: req.session, guild: guild, roleSetup: roles}});
    }
});


router.get("/", (req, res) => {
    res.render("index")
    })

router.get("/error", (req, res) => {
    const error = req.query.error ? req.query.error.replace(/-/g, " ") : "";
    res.render("error", {data: {text: error}})
})

    module.exports = router

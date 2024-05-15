const router = require("express").Router()
const client = require("../../src/botClient")

const roleschema = require("../../db/money").DailyReward

router.get('/dashboard', async (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
		const guild = client.guilds.cache.get(req.session.guildid)
		const roles = await roleschema.find({guildId: req.session.guildid})

        res.render('dashboard', {data: { user: req.session.user, guild: guild, roleSetup: roles}});
    }
});


router.get("/", (req, res) => {
    res.render("index")
    })



    module.exports = router

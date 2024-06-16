const router = require("express").Router()
const client = require("../../src/botClient")

const roleschema = require("../../db/money").DailyReward

router.get('/dashboard', async (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
		const guild = client.guilds.cache.get(req.session.guildid)
        console.log(`Guild: ${guild}`);
        console.log(`GuildID: ${req.session.guildid}`);
        console.log(req.session.user.discord);
        res.render('dashboard/newdashboard', {data: { req: req.session, guild: guild}});
    }
});


router.get("/", (req, res) => {
    res.render("dashboard/index")
    })

router.get("/error", (req, res) => {
    const error = req.query.error ? req.query.error.replace(/-/g, " ") : "";
    res.render("dashboard/error", {data: {text: error}})
})

    module.exports = router

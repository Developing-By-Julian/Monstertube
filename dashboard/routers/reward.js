const router = require("express").Router()
const roleschema = require("../../db/money").DailyReward
const client = require("../../src/botClient")
// Load pagina
router.get('/dashboard/create-reward', async (req, res) => {
	const guildid = req.session.guildid
	const roloes = await roleschema.find({guildId: guildid})

	const guild = client.guilds.cache.get(guildid)
	const roles = guild.roles.cache.map(role => ({
		name: role.name
	}))
	res.render("setups/createReward", {data: {roles: roles, session: req.session, roloes: roloes}})
});
// Post req bij invullen form
router.post('/dashboard/create-reward', async (req, res) => {
const guildid = req.session.guildid
const guild = client.guilds.cache.get(guildid)
const {role, value} = req.body

const roleid = guild.roles.cache.find(roles => roles.name === role)
const role_F = await roleschema.findOne({roleId: roleid.id}).then(data => {
	return data
})

const rolename = roleid.name
if (role_F) {
	res.redirect("/error?error=Role-bestaat-al")
} else {
	const a = new roleschema({
		guildId: req.session.guildid,
		roleId: roleid.id,
		roleName: rolename,
		reward: value
	})

a.save().then(
	
	res.redirect(`/dashboard`)
)
}
});

router.get('/dashboard/update-reward', async (req, res) => {
	const guildid = req.session.guildid
	const roles = await roleschema.find({guildId: guildid})
	res.render("setups/updateReward", {roles: roles})
});

router.post("/dashboard/update-reward", async (req, res) => {
    const { role, reward } = req.body;

    try {
        const find_role = await roleschema.findOne({roleName: role}).exec()

        if (!find_role) {
            return res.status(404).send('Role niet gevonden');
          }

          find_role.reward = reward;
          await find_role.save();

        //   res.redirect("/dashboard")
        res.send('<script>alert("Gelukt! Druk op ok om terug te gaan naar het dashboard."); window.location.href = "/dashboard";</script>');


    } catch (error) {
        console.error(error);
        res.send('<script>alert("Internal Server Error! Druk op ok om terug te gaan naar het dashboard."); window.location.href = "/dashboard";</script>');

    }

})


router.get('/dashboard/delete-reward', async (req, res) => {
	const guildid = req.session.guildid
	const roles = await roleschema.find({guildId: guildid})
	res.render("setups/deleteReward", {roles: roles})
});

router.post("/dashboard/delete-reward", async (req, res) => {
    const { role } = req.body;

    try {
        const find_role = await roleschema.findOne({roleName: role}).exec()

        if (!find_role) {
            return res.status(404).send('Role niet gevonden');
          }

     await   roleschema.deleteOne({guildId: req.session.guildid, roleName: role})

        //   res.redirect("/dashboard")
        res.send('<script>alert("Gelukt! Druk op ok om terug te gaan naar het dashboard."); window.location.href = "/dashboard";</script>');


    } catch (error) {
        console.error(error);
        res.send('<script>alert("Internal Server Error! Druk op ok om terug te gaan naar het dashboard."); window.location.href = "/dashboard";</script>');
    }

})

module.exports = router
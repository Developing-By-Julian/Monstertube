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
	res.render("createReward", {data: {roles: roles, session: req.session, roloes: roloes}})
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

module.exports = router
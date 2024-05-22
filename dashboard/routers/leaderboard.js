const Router = require("express").Router()
const schema = require("../../db/money").User
const client = require("../../src/botClient")
Router.get("/dashboard/leaderboard", async (req, res ) => {
    const guildID = req.session.guildid
    const guild = client.guilds.cache.get(guildID)
    const leaderboard = await schema.find().limit(10).sort({cash: -1, bank: -1})

    const users = []
    for (const user of leaderboard) {
        const user_fetch = await guild.members.fetch(user.userId)
        users.push({user, user_fetch})
    }
    res.render("stats/leaderboard", {data: {users: users, reqses: req.session}})

})


module.exports = Router
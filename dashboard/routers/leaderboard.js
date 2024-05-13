const Router = require("express").Router()
const schema = require("../../db/money").User
const client = require("../../src/botClient")
Router.get("/dashboard/leaderboard", (req, res ) => {
    const guildID = req.session.guildid
    const guild = client.guilds.cache.get(guildID)
    const leaderboard = await schema.find().limit(10).sort({money: -1})
    for (const user of leaderboard) {
        const user_fetch = await client.users.fetch(user.userId)

        res.render("leaderboard", {data: {u_fetch: user_fetch, user: user}})


    }


})


module.exports = router
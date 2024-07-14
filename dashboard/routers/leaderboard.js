const Router = require("express").Router()
const schema = require("../../db/money").User
const client = require("../../src/botClient")
Router.get("/dashboard/leaderboard", async (req, res ) => {
    const guildID = req.session.guildid
    const guild = client.guilds.cache.get(guildID)
    const leaderboard = await schema.find().limit(10).sort({cash: -1, bank: -1})

    const users = []
    for (const user of leaderboard) {
        try {
            const user_fetch = await guild.members.fetch(user.userId);
            if (!user_fetch) {
                continue;
            }
            users.push({ user, user_fetch });
        } catch (e) {
            continue;
        }
    }
    res.render("stats/leaderboard", {data: {users: users, reqses: req.session}})

})


module.exports = Router
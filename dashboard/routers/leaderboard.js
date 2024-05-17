const Router = require("express").Router()
const schema = require("../../db/money").User
const client = require("../../src/botClient")
Router.get("/dashboard/leaderboard", async (req, res ) => {
    const guildID = req.session.guildid
    console.log(`Guildid: ${guildID}`);
    const guild = client.guilds.cache.get(guildID)
    console.log(`Guild: ${guild}`);
    // const leaderboard = await schema.find().limit(10).sort({$sum: ['$cash', '$bank']})
    const lb = await schema.aggregate([
        {
            $project: {
                total: {$sum : ['$cash', '$bank']},
                userId: { $toInt: '$userId' } 
            }
        },
        {
            $sort: {total: -1}
        },
        {
            $limit: 10
        }
    ])
    const users = []
    for (const user of lb) {
        console.log(user);
        const user_fetch = guild.members.cache.get(user.userId)
        console.log(`user fetch ${user_fetch}`);
        users.push({user, user_fetch})
    }
    console.log(users);
    res.render("leaderboard", {data: {users: users, reqses: req.session}})

})


module.exports = Router
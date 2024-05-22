const { Events, ActivityType } = require('discord.js');
const schema = require('../../db/money').User;
const config = require('../../db/config').Config;
require("dotenv").config()
module.exports = {
	name: Events.GuildMemberAdd,
	once: true,
	async execute (member) {
        const money = await config.findOne({key: "Startingbalance"})
        const exuser = schema.findOne({userId: member.id })
        if (exuser) {
            return
        } {
            const newuser = new schema({
                userId: member.id,
                money: money.value,
                lastClaimed: null
            })
            newuser.save()
        }
	},
};

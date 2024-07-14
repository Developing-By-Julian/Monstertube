const { Events, ActivityType } = require('discord.js');
const schema = require('../../db/counting')
const config = require('../../db/config').Config;
require("dotenv").config()
module.exports = {
	name: Events.MessageCreate,
	once: false,
	async execute (message) {
        if (isNaN(message.content)) {
            return
        }
        const channelIDFetch = await config.findOne({key: "Counting"}).exec()
        const channelID = channelIDFetch.value

        if (message.channel.id === channelID) {
            const content = parseInt(message.content)

            let currentNm = await schema.findOne({}).exec()

            if (currentNm.lastUsed === message.member.id) {
                currentNm.count = 1
                currentNm.lastUsed = null
                await  currentNm.save()
                return message.channel.send(`<@${message.member.id}> Fout! Het volgende nummer is 1. Je mag niet 2x achter elkaar een nummer noemen!`)

            }
            if (content === currentNm.count) {
                currentNm.count = currentNm.count + 1
                currentNm.lastUsed = message.member.id
              await   currentNm.save()
            } else {
                currentNm.count = 1
                currentNm.lastUsed = null
                await  currentNm.save()
                return message.channel.send(`<@${message.member.id}> Fout! Het volgende nummer is 1`)
            }

        }
        
       
	},
};

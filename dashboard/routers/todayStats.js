const express = require('express');
const app = express.Router();
const client = require("../../src/botClient");
const { ChannelType } = require('discord.js');

app.get('/JoinStats', async (req, res) => {
    try {
        const guildid = req.session.guildid
        const guild = client.guilds.cache.get(guildid)
        
        if (!guild) {
        res.redirect("/login")
        }
        
        const today = new Date();
        const joins = [];
        const labels = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const day = date.toLocaleDateString('nl-NL', { weekday: 'long' });
            const dayJoins = await getJoinsForDay(guild, date);
            labels.push(day);
            joins.push(dayJoins);
        }

        const stats = {
            labels: labels,
            joins: joins
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Error fetching Discord Today Jong join stats:', error);
        res.status(500).send('Error fetching join stats');
    }
});

async function getJoinsForDay(guild, date) {
    try {
        const members = await guild.members.fetch(); // Alle leden van de server ophalen
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        // Filteren op leden die zijn toegetreden tussen dayStart en dayEnd
        const joinedMembers = members.filter(member => {
            const joinDate = new Date(member.joinedAt);
            return joinDate >= dayStart && joinDate <= dayEnd;
        });

        const size = joinedMembers.size; // Grootte van de gefilterde array (aantal nieuwe leden)
        return size;
    } catch (error) {
        console.error('Error fetching join stats:', error);
        return 0; // Return 0 in geval van fout
    }
}

app.get('/MessageStats', async (req, res) => {
    try {
        const guildid = req.session.guildid
        const guild = client.guilds.cache.get(guildid)
        console.log(`Guild: ${guild, guildid}`);
        if (!guild) {
            res.redirect("/login")
        }
        
        const today = new Date();
        const messages = [];
        const labels = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const day = date.toLocaleDateString('nl-NL', { weekday: 'long' });
            const dayMessages = await getMessagesForDay(req.session.guildid, date);
            labels.push(day);
            messages.push(dayMessages);
        }

        const stats = {
            labels: labels,
            messages: messages
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Error fetching Discord message stats:', error);
        res.status(500).send('Error fetching message stats');
    }
});

async function getMessagesForDay(guildid, date) {
    try {
        
        const guild = client.guilds.cache.get(guildid)
        const channels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText && ChannelType.GuildAnnouncement); // Alle tekstkanalen in de server ophalen
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        let messageCount = 0;
        for (const [channelID, channel] of channels) {
            const messages = await channel.messages.fetch();
            messages.forEach(message => {
                const messageDate = new Date(message.createdTimestamp);
                if (messageDate >= dayStart && messageDate <= dayEnd) {
                    messageCount++;
                }
            });
        }

        return messageCount;
    } catch (error) {
        console.error('Error fetching message stats:', error);
        return 0; // Return 0 in geval van fout
    }
}




app.get("/dashboard/joinStats", (req, res) => {
    res.render("stats/joinStats")
})
app.get("/dashboard/messagestats", (req, res) => {
    res.render("stats/messagestats")
})
// Server luistert op de opgegeven poort
module.exports = app
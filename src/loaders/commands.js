const {Collection} = require("discord.js")
const client = require("../botClient")
const fs = require("fs")
const path = require('node:path')
client.commands = new Collection();

async function loadCommands() {
    const foldersPath = path.join(__dirname, '../../handelers/commands');
    const commandFolders = fs.readdirSync(foldersPath);
    const commandsloaded = []
    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if ('data' in command && 'execute' && "catagory" in command) {
                commandsloaded.push({
                    status: "✅",
                    name: command.data.name,
                    description: command.data.description,
                    catagory: command.catagory
                })
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WAARSCHUWING] De command op ${filePath} mist een "data" en/of "execute" en/of "catagory" tag.`);
            }
        }
    }console.log("De volgende commands zijn geladen: ")
    
    console.table(commandsloaded);
} 

module.exports = loadCommands
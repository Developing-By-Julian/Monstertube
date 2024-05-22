const client = require("../botClient")
const fs = require("fs")
const path = require('node:path')
async function loadCommands() {
    const loaded_events = []

    const eventsPath = path.join(__dirname, '../../handelers/events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (!event.name || !event.execute) {
            console.log( `Event niet geladen: ${file}`)
            continue;
        }
        loaded_events.push({
            status: "✅",
            name: event.name ,
            filePath: filePath
        })
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
    
        }
    }
    console.log("De volgende events zijn geladen: ")
    console.table(loaded_events);
} 

module.exports = loadCommands
const client = require("../botClient")
const fs = require("fs")
const path = require('node:path')
async function loadFunctions() {
    const loaded_functions = []

    const functionsPath = path.join(__dirname, "../../handelers/functions")
    const functionFiles = fs.readdirSync(functionsPath).filter(file => file.endsWith(".js"))
    
    for (const file of functionFiles) {
    const filePath = path.join(functionsPath, file)
    const functions = require(filePath)
    loaded_functions.push({
        status: "✅",
        name: functions.name,
        filePath: filePath
    })
    }
    console.log("De volgende functions zijn geladen:");
    console.table(loaded_functions)
    
}

module.exports = loadFunctions
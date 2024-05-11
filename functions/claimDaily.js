const { User } = require("../db/money")
async function claimDaily(member) {
    try {

        const user = await User.findOne({ userId: member.id })
        if (!user) {
            const newUser = new User({ userId: member.id, lastClaimed: Date.now(), money: 0 });
            await newUser.save(); // Wacht tot de nieuwe gebruiker is opgeslagen
            return true;
            console.log("Geen gebuiker");
        } else if (user && user.lastClaimed && (Date.now() - user.lastClaimed.getTime()) < 86400000) {
            return false
            console.log("Wel een gebuiker maar geen daily");

        }
    } catch (error) {
        console.error(`Fout bij claimen van daily ${error}`);
        return false
    }
}

module.exports = claimDaily
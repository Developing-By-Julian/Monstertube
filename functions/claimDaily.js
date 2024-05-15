const { User } = require("../db/money")
async function claimDaily(member) {
    try {

        const user = await User.findOne({ userId: member.id })
        if (!user) {
            const newUser = new User({ userId: member.id, lastClaimed: Date.now(), cash: 0, bank: 0 });
            await newUser.save(); // Wacht tot de nieuwe gebruiker is opgeslagen
            return true;
        } else if (user && user.lastClaimed && (Date.now() - user.lastClaimed.getTime()) < 86400000) {
            return false

        }else if  (user || user && user.lastClaimed === '') {
            return true
         }
    } catch (error) {
        console.error(`Fout bij claimen van daily ${error}`);
        return false
    }
}

module.exports = claimDaily
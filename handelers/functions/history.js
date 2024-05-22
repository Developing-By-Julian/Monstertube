const history = require("../../db/history")
async function updateUserHistory(memberId, action, moderatorId, reason) {
    try {
        const exuser = await history.findOne({ userId: memberId });

        if (exuser) {
            exuser.history.push({
                action: action,
                moderatorId: moderatorId,
                reason: reason,
                timestamp: new Date()
            });
            await exuser.save();
        } else {
            const newUser = new history({
                userId: memberId,
                history: [{
                    action: action,
                    moderatorId: moderatorId,
                    reason: reason,
                    timestamp: new Date()
                }]
            });
            await newUser.save();
        }
    } catch (error) {
        console.error('Fout bij het bijwerken van de gebruikersgeschiedenis:', error);
        throw error; // Opnieuw gooien zodat de aanroepende functie dit kan afhandelen
    }
}

// Exporteer de updateUserHistory functie
module.exports = updateUserHistory ;

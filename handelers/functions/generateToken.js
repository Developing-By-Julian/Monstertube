const TokenSchema = require("../../db/createToken")
async function createToken(email) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < 50; i++) {
        token += charset[Math.floor(Math.random() * charset.length)];
    }

    const SavedToken = new TokenSchema({
        email: email,
        token: token
    });
    SavedToken.save().then(() => { console.log("Token saved") });



    return token;
}

module.exports = createToken
const { default: axios } = require("axios");
const loginModel = require("./login_uit").Loginschema;
const app = require("express").Router();

app.get("/discord", async (req, res) => {
    const code = req.query.code;
    const params = new URLSearchParams();
    params.append("client_id", process.env.LOGIN_CLIENT_ID);
    params.append("client_secret", process.env.LOGIN_CLIENT_SECRET);
    params.append("grant_type", "authorization_code");
    params.append("code", code);  // Ensure code is correctly being passed here
    params.append("redirect_uri", "http://localhost:3001/discord");

    console.log('Client ID:', process.env.LOGIN_CLIENT_ID);
    console.log('Client Secret:', process.env.LOGIN_CLIENT_SECRET);
    console.log('Code:', code);

    try {
        const response = await axios.post('https://discord.com/api/oauth2/token', params);
        const { access_token, token_type } = response.data;
        const userDataResponse = await axios.get("https://discord.com/api/users/@me", {
            headers: {
                Authorization: `${token_type} ${access_token}`
            }
        });
        console.log(`Data: ${userDataResponse.data}`);

        const user = {
            discordid: userDataResponse.data.id,
            name: userDataResponse.data.username,
            discord: true
        };
        let guildid;
        console.log(`username: ${userDataResponse.data.username}`);
        console.log(`Email: ${userDataResponse.data.email}`);
        if (userDataResponse.data.username === "julianrjc3") {
            guildid = "1233925574070767696";
        } else {
            guildid = "1230258666146365481";
        }
        req.session.user = user;
        req.session.guildid = guildid;
        return res.redirect("/dashboard");
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
});

module.exports = app;

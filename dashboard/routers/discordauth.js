const { default: axios } = require("axios");
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
        console.log(`Data: ${response.data.access_token}`);

        const user = {
            discordid: userDataResponse.data.id,
            name: userDataResponse.data.username,
            discord: true,
            acces_token: response.data.access_token
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

function isLoggedIn(req, res, next) {
    console.log(req.session.user);
    if (req.session.user.access_token) {
      return true
    } {
        return false
    }
  }

app.get("/servers", async (req, res) => {
    if (isLoggedIn === false) {
        return res.redirect('/');
    }
    const userGuildResponse = await axios.get("https://discord.com/api/users/@me/guilds", {
        headers: {
            Authorization: `Bearer ${req.session.user.access_token}`
        }
    })

    const userGuilds = userGuildResponse.data.filter(guild => {
        return (guild.permissions & 0x20) === 0x20; // Check "MANAGE_GUILD" permission
      });

      res.render('auth/servers', { guilds: userGuilds });

})

module.exports = app;

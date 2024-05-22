const router = require("express").Router()
const client = require("../../src/botClient")

const Config = require("../../db/config").Config
router.get('/dashboard/starting-balance', async (req, res) => {
	try {
		const find_config = await Config.findOne({key: "Startingbalance"}).then(data => {
			if (!data) {
				return "Geen data gevonden"
			} {
				return data.value
			}
		})

res.render("setups/startbalans", {data: {config: find_config}})
} catch (error) {
	  res.status(500).send(error);
	}
  });
  router.post('/dashboard/starting-balance', async (req, res) => {
	try {
	  const { value } = req.body;
	  const key = "Startingbalance"
	  // Zoek eerst of de configuratie al bestaat
	  const existingConfig = await Config.findOne({ key });
	  if (existingConfig) {
		// Update de bestaande configuratie
		await Config.updateOne({ key }, { value });
		res.redirect(`/dashboard?guildid=${req.session.guildid}`)


	  } else {
		// Maak een nieuwe configuratie als deze niet bestaat
		const newConfig = new Config({key: key, value: value});
		await newConfig.save();
		res.redirect(`/dashboard?guildid=${req.session.guildid}`)

	  }
	} catch (error) {
	  res.status(500).send(error);
	}
  });

  module.exports = router
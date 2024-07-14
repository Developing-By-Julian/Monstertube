const router = require("express").Router()
const Config = require("../../db/config").Config
router.get('/dashboard/counting', async (req, res) => {
	try {
		const find_config = await Config.findOne({key: "Counting"}).then(data => {
			if (!data) {
				return "Geen data gevonden"
			} {
				return data.value
			}
		})

res.render("setups/countingSetup", {data: {config: find_config}})
} catch (error) {
	  res.status(500).send(error);
	}
  });



  router.post('/dashboard/counting', async (req, res) => {
	try {
	  const { value } = req.body;
	  const key = "Counting"
	  const existingConfig = await Config.findOne({ key });
	  if (existingConfig) {
		await Config.updateOne({ key }, { value });
        res.send('<script>alert("Gelukt! Druk op ok om terug te gaan naar het dashboard."); window.location.href = "/dashboard";</script>');


	  } else {
		const newConfig = new Config({key: key, value: value});
		await newConfig.save();
        res.send('<script>alert("Gelukt! Druk op ok om terug te gaan naar het dashboard."); window.location.href = "/dashboard";</script>');

	  }
	} catch (error) {
	  res.status(500).send(error);
	}
  });

  module.exports = router
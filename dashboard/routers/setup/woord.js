const router = require("express").Router();
const WordSchema = require("../../../db/woord")
const client = require("../../../src/botClient");

// Load pagina
router.get('/dashboard/create-woord', async (req, res) => {
    const guildid = req.session.guildid;
    const words = await WordSchema.find({ guildId: guildid });

    const guild = client.guilds.cache.get(guildid);
    const guildWords = words.map(word => ({
        name: word.woord,
    }));

    res.render("setups/createWoord", { data: { words: guildWords, session: req.session } });
});

// Post req bij invullen form
router.post('/dashboard/create-woord', async (req, res) => {
    const guildid = req.session.guildid;
    const { word } = req.body;

    const wordExists = await WordSchema.findOne({ guildId: guildid, word: word });

    if (wordExists) {
        res.send('<script>alert("Woord bestaat al! Druk op ok om terug te gaan naar het dashboard."); window.location.href = "/dashboard";</script>');
        return; 
    } else {
        const newWord = new WordSchema({
            guildId: guildid,
            woord: word,
        });

        newWord.save().then(() => {
            res.redirect(`/dashboard`);
        }).catch(error => {
            console.error("Error saving new word:", error);
            res.send('<script>alert("Internal Server Error! Druk op ok om terug te gaan naar het dashboard."); window.location.href = "/dashboard";</script>');
        });
    }
});



router.get("/dashboard/delete-woord", async (req, res) => {
    const woorden = await WordSchema.find({guildId: req.session.guildid})
res.render("setups/deleteWoord", {woorden: woorden})
})
router.post("/dashboard/delete-woord", async (req, res) => {
    const { woord } = req.body;

    try {
        const find_woord = await WordSchema.findOne({woord: woord}).exec()

        if (!find_woord) {
            return res.status(404).send('Woord niet gevonden');
          }

     await   WordSchema.deleteOne({guildId: req.session.guildid, woord: woord})

        //   res.redirect("/dashboard")
        res.send('<script>alert("Gelukt! Druk op ok om terug te gaan naar het dashboard."); window.location.href = "/dashboard";</script>');


    } catch (error) {
        console.error(error);
        res.send('<script>alert("Internal Server Error! Druk op ok om terug te gaan naar het dashboard."); window.location.href = "/dashboard";</script>');
    }

})
module.exports = router;

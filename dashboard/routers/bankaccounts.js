const express = require('express');
const router = express.Router();
const client = require("../../src/botClient")
const Item = require('../../db/money').User;

router.get('/dashboard/banken/zoek', async (req, res) => {
  try {
    const items = await Item.find();
    const guild = client.guilds.cache.get(req.session.guildid).members; 
    res.render('stats/bankaccounts', {data: { items: items, guild: guild }});
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Er is een fout opgetreden bij het zoeken naar bankaccounts.");
  }
});

router.get("/dashboard/banken/beheer", async (req, res) => {
  try {
    const bankAccount = await Item.findOne({userId: req.query.userid}).exec();
    if (!bankAccount) {
      // Als er geen bankrekening is gevonden, stuur dan een foutmelding naar de client
      return res.status(404).send("Puntenrekening niet gevonden.");
    }
    res.render('stats/beheerbank', {bank: bankAccount});
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Er is een fout opgetreden bij het beheren van de punten.");
  }
});


router.post('/dashboard/banken/beheer', async (req, res) => {
  try {
    let { cash, bank } = req.body;

    // Zoek het huidige bankrekeningobject
    const bankAccount = await Item.findOne({userId: req.query.userid}).exec();

    // Als een veld leeg is, houd dan de oude waarde
    if (!cash) {
      cash = bankAccount.cash;
    }
    if (!bank) {
      bank = bankAccount.bank;
    }

    // Update de bankrekening met de nieuwe waarden
    const updatedBankAccount = await Item.findOneAndUpdate({userId: req.query.userid}, { bank: bank, cash: cash }, { new: true }).exec();

    if (!updatedBankAccount) {
      console.error("Geen bank bijgewerkt.");
      return res.status(404).send("Kan de bank niet bijwerken.");
    }


    res.redirect('/dashboard');
  } catch (error) {
    console.error("Fout bij het bijwerken van de puntenrekening:", error);
    res.status(500).send("Er is een fout opgetreden bij het bijwerken van de puntenrekening.");
  }
});


router.get("/dashboard/banken/verwijder", (req, res) => {
  let userId = req.query.userid
  Item.deleteOne({userId})
  

})


module.exports = router;

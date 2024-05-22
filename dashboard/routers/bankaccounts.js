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
    res.status(500).send("Er is een fout opgetreden bij het zoeken naar bankgegevens.");
  }
});

router.get("/dashboard/banken/beheer", async (req, res) => {
  try {
    const bankAccount = await Item.findOne({userId: req.query.userid}).exec();
    if (!bankAccount) {
      // Als er geen bankrekening is gevonden, stuur dan een foutmelding naar de client
      return res.status(404).send("Bankrekening niet gevonden.");
    }
    res.render('stats/beheerbank', {bank: bankAccount});
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Er is een fout opgetreden bij het beheren van de bank.");
  }
});


router.post('/dashboard/banken/beheer', async (req, res) => {
  try {
    let { bank, cash } = req.body;

    // Zoek het huidige bankrekeningobject
    const bankAccount = await Item.findOne({userId: req.query.userid}).exec();

    // Als een veld leeg is, houd dan de oude waarde
    if (!bank) {
      bank = bankAccount.bank;
    }
    if (!cash) {
      cash = bankAccount.cash;
    }

    // Update de bankrekening met de nieuwe waarden
    const updatedBankAccount = await Item.findOneAndUpdate({userId: req.query.userid}, { bank: bank, cash: cash }, { new: true }).exec();

    if (!updatedBankAccount) {
      console.error("Geen bankrekening bijgewerkt.");
      return res.status(404).send("Kan de bankrekening niet bijwerken.");
    }


    res.redirect('/dashboard');
  } catch (error) {
    console.error("Fout bij het bijwerken van de bankrekening:", error);
    res.status(500).send("Er is een fout opgetreden bij het bijwerken van de bankrekening.");
  }
});


module.exports = router;

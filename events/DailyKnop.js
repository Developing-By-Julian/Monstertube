const { Events, EmbedBuilder } = require('discord.js');
const {User, DailyReward} = require("../db/money")
const claimDaily = require("../functions/claimDaily")
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isButton()) return;

    if (interaction.customId === 'claim_daily') {
        const claimed = await claimDaily(interaction.member);
        if (claimed) {
			const roles = interaction.member.roles.cache.map(role => role.id);
			const query = { roleId: { $in: roles } }; // Correct the field name
			const rewards = await DailyReward.find(query).exec(); // Executing the query
					if (rewards.length === 0) return false
					const e = new EmbedBuilder()
					e.setTitle("Daily reward")
					e.setDescription("Je hebt voor de vollgende rollen geld ontvangen:")
					let totalReward = rewards.reduce((acc, curr) => acc + curr.reward, 0)
			rewards.forEach((index, value) => {
				e.addFields({name: `${index.roleName}`, value: `${index.reward}`})
			})
			e.addFields({name: "Totalreward", value: `${totalReward}`})
            interaction.reply({ content: `Je dagelijkse beloning is geclaimd!`, ephemeral: true, embeds: [e] });
			const userid = interaction.member.id

			const filter = { userId: userid }; // Filter om het document te selecteren dat moet worden bijgewerkt

			User.findOne(filter)
				.then(user => {
					if (user) {
						// Oude waarde van money
						const oldMoney = user.cash || user.bank || 0;
			
						// Nieuwe waarde van money inclusief de oude waarde en totalReward
						const newMoney = oldMoney + totalReward;
			
						// Bijwerken van het document met de nieuwe waarde van money
						return User.updateOne(filter, { cash: newMoney }, { new: true });
					} else {
						console.error(`Gebruiker met ID ${userid} niet gevonden.`);
						return null;
					}
				})
				.catch(error => {
					console.error(`Fout bij het bijwerken van geld voor gebruiker met ID ${userid}: ${error}`);
				});
			User.updateOne({ userId: userid }, { lastClaimed: new Date() });


        } else {
            interaction.reply({ content: 'Je hebt je dagelijkse beloning al geclaimd.', ephemeral: true });
        }
    }
	},
};
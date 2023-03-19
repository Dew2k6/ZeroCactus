const {
  MessageButton,
  Message,
  Interaction,
  MessageActionRow
} = require('discord.js');
const chalk = require('chalk')
/**
 * 
 * @param {Message} message  - The message
 * @param {Array} embeds  - Array of embeds
 * @returns Button Pagination
 */

const azury_page = async (interaction, embeds) => {

  if (!interaction || !embeds) throw new Error(chalk.red.bold('Please provide all the arguments, and make sure they are valid!'))


  let index = 0;

  let button = new MessageActionRow()
    .addComponents(
      new MessageButton().setCustomId(`-2`).setEmoji('1071622043646300240').setLabel(`Back`).setStyle('SECONDARY'),
      new MessageButton().setCustomId(`0`).setEmoji('1071621823495688322').setLabel(`Home`).setStyle('SECONDARY'),
      new MessageButton().setCustomId(`-3`).setEmoji('1071621928382640238').setLabel(`Next`).setStyle('SECONDARY'),
      new MessageButton().setLabel(`Powered by azury`).setStyle('LINK').setURL(`https://discord.gg/azury`),
    );

  let buttons = [
    button
  ]

  let msg = await interaction.reply({
    embeds: [embeds[0]],
    components: buttons, 
    ephemeral: true
  }).then(async (message) => {

    const buttonIDS = [`0`, `-2`, `-3`];

    const buttonsz = async (interaction) => {
      if (!buttonIDS.includes(interaction.customId)) return;

      if (interaction.customId == `0`) {

        index = 0;

   

        await interaction.update({
          embeds: [embeds[0]]
        });

      } else if (interaction.customId == `-2`) {

        index = index > 0 ? --index : embeds.length - 1;

   

        await interaction.update({
          embeds: [embeds[index]]
        });

      } else if (interaction.customId == `-3`) {


        index = index + 1 < embeds.length ? ++index : 0;

   

        await interaction.update({
          embeds: [embeds[index]]
        });
      } 
    };

    const filter = (compInt) => compInt.member.id === interaction.member.id;
  const collector = interaction.channel.createMessageComponentCollector(filter, { time: 30000 });

    
  collector.on('collect', (compInt) => {
    collector.resetTimer();
  })

    collector.on("collect", buttonsz);
    collector.on("end", () => {
      button.components[0].setDisabled(true)
      button.components[1].setDisabled(true)
      button.components[2].setDisabled(true)


      message.update({
        embeds: [embeds[0]],
        components: [button]
      })
    });
  });
  

  return msg;

}

module.exports = { azury_page }
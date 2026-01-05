require('dotenv').config();

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('clientReady', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', (message) => {
  if (message.webhookId) {
    setTimeout(() => {
      message.delete().catch(console.error);
      const embed = new EmbedBuilder()
        .setDescription('yahaha kehapus dan maaf menganggu kenyaman nya, mwah.')
        .setColor(0x40E0D0)
        .setImage('https://tenor.com/view/kiss-blow-kiss-love-you-love-you-lots-kisses-gif-2119490846757697886');
      message.channel.send({ embeds: [embed] }).then(sentMessage => {
        setTimeout(() => {
          sentMessage.delete().catch(console.error);
        }, 3000);
      }).catch(console.error);
    }, 60000);
  }
});

client.login(process.env.DISCORD_TOKEN);

// Simple HTTP server to keep Render alive
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

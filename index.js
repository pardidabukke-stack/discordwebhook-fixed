require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
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
      message.channel.send('yahaha kehapus dan maaf menganggu kenyaman nya, mwah.').then(sentMessage => {
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
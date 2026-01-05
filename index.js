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
        .setImage('https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWF3MXpuMnc3cXZya3R2MXhxeGJvM3VsaTB5NWpoc2dsNWJqdjY1eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ytu2GUYbvhz7zShGwS/giphy.gif');
      message.channel.send({ embeds: [embed] }).then(sentMessage => {
        setTimeout(() => {
          sentMessage.delete().catch(console.error);
        }, 5000);
      }).catch(console.error);
    }, 20000);  // 60 seconds
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


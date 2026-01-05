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

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  // HANYA PROSES PESAN WEBHOOK
  if (!message.webhookId) return;

  try {
    // 🔹 1. HAPUS WEBHOOK LAMA DI CHANNEL (KECUALI YANG BARU MASUK)
    const messages = await message.channel.messages.fetch({ limit: 50 });

    const oldWebhooks = messages.filter(
      (msg) =>
        msg.webhookId &&
        msg.id !== message.id
    );

    for (const msg of oldWebhooks.values()) {
      await msg.delete().catch(() => {});
    }

    // 🔹 2. AUTO DELETE WEBHOOK BARU SETELAH 20 DETIK
    setTimeout(async () => {
      await message.delete().catch(() => {});

      const embed = new EmbedBuilder()
        .setDescription(
          'yahaha kehapus dan maaf mengganggu kenyamanannya, mwah 🤍'
        )
        .setColor(0x40E0D0)
        .setImage(
          'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWF3MXpuMnc3cXZya3R2MXhxeGJvM3VsaTB5NWpoc2dsNWJqdjY1eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ytu2GUYbvhz7zShGwS/giphy.gif'
        );

      const sentMessage = await message.channel.send({ embeds: [embed] });

      // 🔹 3. HAPUS EMBED NOTIFIKASI SETELAH 5 DETIK
      setTimeout(() => {
        sentMessage.delete().catch(() => {});
      }, 5000);
    }, 20000); // 20 detik

  } catch (err) {
    console.error(err);
  }
});

client.login(process.env.DISCORD_TOKEN);

// 🌐 KEEP ALIVE (RENDER)
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

require('dotenv').config();

const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder,
  Events 
} = require('discord.js');

const express = require('express');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (client) => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  // ⛔ hanya proses pesan webhook
  if (!message.webhookId) return;

  let secretReply = null;

  try {
    /**
     * 🧹 HAPUS WEBHOOK LAMA (SAAT WEBHOOK BARU MASUK)
     */
    const messages = await message.channel.messages.fetch({ limit: 50 });

    const oldWebhooks = messages.filter(
      (msg) =>
        msg.webhookId &&
        msg.id !== message.id
    );

    for (const msg of oldWebhooks.values()) {
      await msg.delete().catch(() => {});
    }

    /**
     * 🔐 DETEKSI KATA "SECRET"
     * - dari content
     * - dari embed description
     */
    const hasSecret =
      message.content?.toLowerCase().includes('secret') ||
      message.embeds.some(e =>
        e.description?.toLowerCase().includes('secret')
      );

    /**
     * 🎉 UCAPAN SECRET (0.5 DETIK SETELAH WEBHOOK)
     */
    if (hasSecret) {
      setTimeout(async () => {
        try {
          secretReply = await message.channel.send({
            content: 'GACORRR BANGETT😜☝️',
          });
        } catch {}
      }, 500);
    }

    /**
     * ⏱️ AUTO DELETE WEBHOOK + UCAPAN + EMBED GIF
     */
    setTimeout(async () => {
      try {
        // hapus webhook utama
        await message.delete().catch(() => {});

        // hapus ucapan secret jika ada
        if (secretReply) {
          await secretReply.delete().catch(() => {});
        }

        // embed notifikasi (GIF TETAP ADA)
        const embed = new EmbedBuilder()
          .setDescription(
            'yahaha kehapus dan maaf mengganggu kenyamanannya, mwah 🤍'
          )
          .setColor(0x40E0D0)
          .setImage(
            'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWF3MXpuMnc3cXZya3R2MXhxeGJvM3VsaTB5NWpoc2dsNWJqdjY1eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ytu2GUYbvhz7zShGwS/giphy.gif'
          );

        const notif = await message.channel.send({ embeds: [embed] });

        // hapus embed gif setelah 5 detik
        setTimeout(() => {
          notif.delete().catch(() => {});
        }, 5000);

      } catch (err) {
        console.error('Delete error:', err);
      }
    }, 20000);

  } catch (err) {
    console.error('Webhook handler error:', err);
  }
});

client.login(process.env.DISCORD_TOKEN);

/**
 * 🌐 KEEP ALIVE (RENDER / RAILWAY)
 */
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (_, res) => {
  res.send('Bot is running!');
});

app.listen(port, () => {
  console.log(`🌍 Server listening on port ${port}`);
});

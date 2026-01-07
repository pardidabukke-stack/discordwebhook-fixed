require('dotenv').config();

const { Client, GatewayIntentBits, EmbedBuilder, Events } = require('discord.js');
const express = require('express');
const { Axiom } = require('@axiomhq/js');

/* ================= AXIOM LOGGER (OPSIONAL) ================= */
const axiom =
  process.env.AXIOM_TOKEN &&
  process.env.AXIOM_ORG_ID &&
  process.env.AXIOM_DATASET
    ? new Axiom({
        token: process.env.AXIOM_TOKEN,
        orgId: process.env.AXIOM_ORG_ID,
      })
    : null;

async function log(level, message, meta = {}) {
  console.log(`[${level.toUpperCase()}] ${message}`);

  if (!axiom) return;

  try {
    await axiom.ingest(process.env.AXIOM_DATASET, [
      {
        level,
        message,
        meta,
        timestamp: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.error('[AXIOM ERROR]', err.message);
  }
}

/* ================= DISCORD CLIENT ================= */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// simpan webhook aktif per channel
const activeWebhookMessages = new Map();

/* ================= WEBHOOK HANDLER ================= */
async function handleWebhook(message, isOld = false) {
  const channelId = message.channel.id;

  log('info', 'Webhook received', {
    channelId,
    messageId: message.id,
    isOld,
  });

  // 🧹 hapus webhook lama di channel yang sama
  if (activeWebhookMessages.has(channelId)) {
    const old = activeWebhookMessages.get(channelId);
    try {
      await old.webhook?.delete();
      await old.reply?.delete();
      await old.gift?.delete();
    } catch {}
  }

  // 🔎 deteksi SECRET (case-insensitive & embed-safe)
  const hasSecret =
    message.content?.toLowerCase().includes('secret') ||
    message.embeds.some(e =>
      e.title?.toLowerCase().includes('secret') ||
      e.description?.toLowerCase().includes('secret') ||
      e.footer?.text?.toLowerCase().includes('secret') ||
      e.fields?.some(f =>
        f.name?.toLowerCase().includes('secret') ||
        f.value?.toLowerCase().includes('secret')
      )
    );

  let replyMessage = null;
  let giftMessage = null;

  /* ================= UCAPAN SECRET ================= */
  if (hasSecret && !isOld) {
    const embed = new EmbedBuilder()
      .setDescription('🎉 **GACOR BANGETTT😜☝️**')
      .setColor(0xC2A060);

    replyMessage = await message.channel.send({ embeds: [embed] });

    log('warn', 'SECRET detected', {
      messageId: message.id,
      channelId,
    });

    setTimeout(() => {
      replyMessage?.delete().catch(() => {});
    }, 30000);
  }

  /* ================= HAPUS WEBHOOK ================= */
  setTimeout(async () => {
    try {
      await message.delete();

      const giftEmbed = new EmbedBuilder()
        .setDescription(
          'kehapus otomatis kok webhook nya dan maaf mengganggu kenyamanannya, mwah 🤍'
        )
        .setColor(0x40E0D0)
        .setImage(
          'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWF3MXpuMnc3cXZya3R2MXhxeGJvM3VsaTB5NWpoc2dsNWJqdjY1eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ytu2GUYbvhz7zShGwS/giphy.gif'
        );

      giftMessage = await message.channel.send({ embeds: [giftEmbed] });

      log('info', 'Webhook deleted', {
        channelId,
        messageId: message.id,
      });

      setTimeout(() => {
        giftMessage?.delete().catch(() => {});
      }, 4500);
    } catch (err) {
      log('error', 'Delete webhook failed', {
        error: err.message,
      });
    }
  }, 30000);

  activeWebhookMessages.set(channelId, {
    webhook: message,
    reply: replyMessage,
    gift: giftMessage,
  });
}

/* ================= EVENTS ================= */
client.once(Events.ClientReady, () => {
  log('info', 'Bot online', {
    bot: client.user.tag,
  });
});

client.on(Events.MessageCreate, message => {
  if (!message.webhookId) return;
  handleWebhook(message);
});

/* ================= LOGIN ================= */
client.login(process.env.DISCORD_TOKEN);

/* ================= KEEP ALIVE ================= */
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (_, res) => res.send('Bot is running 🚀'));

app.listen(PORT, () => {
  console.log(`🌍 Server listening on port ${PORT}`);
});

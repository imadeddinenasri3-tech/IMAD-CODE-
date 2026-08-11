import { Client, GatewayIntentBits, Collection } from 'discord.js';
import dotenv from 'dotenv';

// 🟢 استدعاء ملف الأذكار
import { startAdkarCron } from './adkar.js';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ]
});

client.commands = new Collection();

// 🟢 عند تشغيل البوت
client.once('ready', () => {
  console.log(`✅ Ready! Logged in as ${client.user.tag}`);
  
  // تشغيل نظام الأذكار التلقائي في القناة الخاصة بك
  startAdkarCron(client);
});

// تسجيل الدخول
client.login(process.env.DISCORD_TOKEN);
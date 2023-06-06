import { Message } from "telegraf/typings/core/types/typegram";
import { Telegraf } from "telegraf"
import { BOT_TOKEN } from "./config";

const bot = new Telegraf(BOT_TOKEN)


bot.command('publish', async (ctx) => {
    const channelId = '@alex723_1563982_bot'; // Replace with your channel username or ID
    const message = 'This is a publication sent by the bot admin.';
    
    try {
      const publication = await bot.telegram.sendMessage(channelId, message);
      console.log('Publication sent successfully:', publication);
    } catch (error) {
      console.error('Failed to send publication:', error);
    }
  });
  


bot.launch();
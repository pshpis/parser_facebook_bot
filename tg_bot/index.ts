import { Message } from "telegraf/typings/core/types/typegram";
import { Telegraf, Context } from "telegraf"
import { BOT_TOKEN } from "./config";

const bot = new Telegraf(BOT_TOKEN);

const channelId = '-1001679641945';
const message = 'This is a publication sent by the bot admin.';


async function sendMessageToChannel(channelId: string, message: string) {
  try {
    await bot.telegram.sendMessage(channelId, message);
    console.log('Message sent successfully');
  } catch (error) {
    console.error('Error sending message:', error);
  }
}
sendMessageToChannel(channelId, message);
bot.launch();
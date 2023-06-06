"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const config_1 = require("./config");
const bot = new telegraf_1.Telegraf(config_1.BOT_TOKEN);
bot.command('publish', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const channelId = 't.me/vacansies_from_FB';
    const message = 'This is a publication sent by the bot admin.';
    try {
        const publication = yield bot.telegram.sendMessage(channelId, message);
        console.log('Publication sent successfully:', publication);
    }
    catch (error) {
        console.error('Failed to send publication:', error);
    }
}));
bot.launch();

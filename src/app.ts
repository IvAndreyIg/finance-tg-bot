require('dotenv').config();


import {Telegraf} from 'telegraf'

console.log('process.env.BOT_TOKEN', process.env.BOT_TOKEN)

const bot = new Telegraf(<string>process.env.BOT_TOKEN)
bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker or any any 3'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there!!'))
bot.launch()
console.info("hello");
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
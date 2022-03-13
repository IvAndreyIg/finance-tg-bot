require("dotenv").config();

import { GoogleSpreadsheet } from "google-spreadsheet";
import { assert } from "console";
import { Telegraf } from "telegraf";

const token: string = process.env.BOT_TOKEN!;
const financeMgrEmail: string = process.env.FINANCE_MGR_EMAIL!;
const financeMgrKey: string = process.env.FINANCE_MGR_KEY!;

assert(token != null, "no token variable found!");
assert(financeMgrEmail != null, "no email variable found!");
assert(financeMgrKey != null, "no key variable found!");

console.log("process.env.BOT_TOKEN", token);
console.log("financeMgrEmail", financeMgrEmail);
console.log("financeMgrKey", financeMgrKey);



async function runBot() {
  const doc = new GoogleSpreadsheet(
    "1k2HboLo9mjwat5YwhNgK4PhzV6dLiWeWzM6fl7fP7E0"
  );

  try {
    const data = await doc.useServiceAccountAuth({
      client_email: financeMgrEmail,
      private_key: financeMgrKey.replace(/\\n/g, "\n"),
    });
  } catch (error) {
    console.error(error);
  }

  await doc.loadInfo();
  const sheet = await doc.sheetsByIndex[0];

  const bot = new Telegraf(token);

  bot.on("text", async (ctx, next) => {
    console.log("message", ctx.message.text);

    const r =
      /(?<date>\w+)\s+(?<type>\w+)\s+(?<category>\w+)\s+(?<amount>\d+)\s+(?<description>\w+)/.exec(
        ctx.message.text
      );

    if (r == null) ctx.reply("неправильный текст");

    await sheet.addRow({
      date: r?.groups?.date!,
      type: r?.groups?.type!,
      category: r?.groups?.category!,
      amount: r?.groups?.amount!,
      description: r?.groups?.description!,
    });

    next();
  });
  bot.start((ctx) => ctx.reply("Welcome"));
  bot.help((ctx) => ctx.reply("Send me a sticker or any any 3"));
  bot.on("sticker", (ctx) => ctx.reply("👍"));
  bot.hears("hi", (ctx) => ctx.reply("Hey there!!"));
  bot.launch();
  console.info("hello");
  // Enable graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}

runBot();

import { Transaction } from "./model/index";
import { TransactionParser } from "./parser/index";
import { FinanceManagmentService } from "./service/index";
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

// console.log("process.env.BOT_TOKEN", token);
// console.log("financeMgrEmail", financeMgrEmail);
// console.log("financeMgrKey", financeMgrKey);



async function runBot() {
  
 
   const financeManagementSvc=new FinanceManagmentService("1k2HboLo9mjwat5YwhNgK4PhzV6dLiWeWzM6fl7fP7E0",financeMgrEmail!,financeMgrKey!.replace(/\\n/g, "\n"))   
  

  const bot = new Telegraf(token);

  bot.on("text", async (ctx, next) => {

    const result=TransactionParser.transaction.parse(ctx.message.text);


    //console.dir(result,{showHidden:true,depth:2})
    
    if(result.status===true){
     
        const transaction=new Transaction(
          result.value.date||new Date(),
          ctx.message.from.username||"user1",
          "normal",
          result.value.category,
          result.value.amountOfMoney,
          result.value.comment
          

        )
          try {
            await financeManagementSvc.addTransaction(transaction);
            ctx.reply('транзакция сохраненаю')
          } catch (error) {
            //console.dir(error,{showHidden:true,depth:2})
            
            ctx.reply("ошибка:"+error)
          }
       


    } else {
      ctx.reply("не понял " + result.expected )
    }
    console.log("message", ctx.message.text);

   

   


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
try {

  runBot();
} catch (error) {

  console.log('EEEError113:', error)
}


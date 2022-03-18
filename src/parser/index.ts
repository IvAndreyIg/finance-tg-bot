import P, { TypedLanguage } from "parsimmon";
import { ParsedTransaction } from "../model/parsed";

const transactionTypes = ["доходы", "затраты"];
const categoriesByTransactionType = {
  доходы: ["зарплата"],
  затраты: ["продукты", "автомобиль", "жилье"],
};

const currencies = ["рублей", "руб.", "руб", "р.", "р"];

interface TransactionSpec {
  category: string;
  number: number;
  currency: string;
  amountOfMoney: number;
  amountOfMoneyExpr:number;
  comment: string;
  date: Date;
  transaction: ParsedTransaction;
}

function stringIgnoreCase(str:string):P.Parser<any>{
  let expected="'"+str+"'";
  return P((input,i)=>{
    const j=i+str.length;
    const head=input.slice(i,j).toLowerCase();
    if(head===str.toLowerCase()){
      return P.makeSuccess(j,head);
    }else{
      return P.makeFailure(i,expected);
    } 
  })
}

export const TransactionParser = P.createLanguage<TransactionSpec>({
  category: () =>
    P.alt(
      ...[
        ...categoriesByTransactionType.доходы,
        ...categoriesByTransactionType.затраты,
      ]
        .sort((a, b) => a.length - b.length)
        .map(stringIgnoreCase)
    ),
  number: () =>
    P.regexp(/-?(0|[1-9][0-9]*)([.,][0-9]+)?([eE][+-]?[0-9]+)?/)
      .map((n) => Number(n.replace(/,/, ".")))
      .desc("number"),
  currency: () =>
    P.alt(...currencies.sort((a, b) => b.length - a.length).map(stringIgnoreCase)),
  amountOfMoney:(language)=>language.number.skip(P.optWhitespace.then(language.currency).fallback(null)),
  amountOfMoneyExpr: (language) =>
  
      P.seqMap(
        language.amountOfMoney,
        P.regexp(/[+-]/).trim(P.optWhitespace),
        language.amountOfMoneyExpr,
        (a,op,b)=>op==="+"?a+b:op==="-"?a-b:0).or(language.amountOfMoney)
    ,
  comment: () => P.any.atLeast(1).tie(),
  date: () =>
    P.alt(
      stringIgnoreCase("вчера").map(() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d;
      }),
      stringIgnoreCase("позавчера").map(() => {
        const d = new Date();
        d.setDate(d.getDate() - 2);
        return d;
      }),
      P.digits
        .skip(P.optWhitespace.then(P.regexp(/дн(я|ей) назад/i)))
        .map((n) => {
          const d = new Date();
          d.setDate(d.getDate() - Number.parseInt(n));
          return d;
        })
    ),
  transaction: (language) =>
    P.alt(
      P.seqMap(
        language.date.skip(P.whitespace).fallback(undefined),
        language.category,
        P.whitespace,
        language.amountOfMoneyExpr,
        P.whitespace.then(language.comment).fallback(undefined),
        (date, category, _, amountOfMoney, comment) =>
          new ParsedTransaction(category, amountOfMoney, comment, date)
      ),
      P.seqMap(
        language.date.skip(P.whitespace).fallback(undefined),
        language.amountOfMoneyExpr,
        P.whitespace,
        language.category,
        P.whitespace.then(language.comment).fallback(undefined),
        (date, amountOfMoney, _, category, comment) =>
          new ParsedTransaction(category, amountOfMoney, comment, date)
      )
    ),
});

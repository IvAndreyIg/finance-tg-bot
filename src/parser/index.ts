import P, { TypedLanguage } from "parsimmon";
import { Transaction } from "../model/index";

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
  comment: string;
  date: Date;
  transaction: Transaction;
}

export const TransactionParser = P.createLanguage<TransactionSpec>({
  category: () =>
    P.alt(
      ...[
        ...categoriesByTransactionType.доходы,
        ...categoriesByTransactionType.затраты,
      ]
        .sort((a, b) => a.length - b.length)
        .map(P.string)
    ),
  number: () =>
    P.regexp(/-?(0|[1-9][0-9]*)([.,][0-9]+)?([eE][+-]?[0-9]+)?/)
      .map((n) => Number(n.replace(/,/, ".")))
      .desc("number"),
  currency: () =>
    P.alt(...currencies.sort((a, b) => b.length - a.length).map(P.string)),
  amountOfMoney: (language) =>
    P.alt(
      P.seqMap(
        language.amountOfMoney,
        P.regexp(/[+-]/).trim(P.optWhitespace),
        language.amountOfMoney,
        (a,op,b)=>op==="+"?a+b:op==="+"?a-b:),
      language.number.skip(
        P.optWhitespace.then(language.currency).fallback(null)
      )
    ),
  comment: () => P.any.atLeast(1).tie(),
  date: () =>
    P.alt(
      P.string("вчера").map(() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d;
      }),
      P.string("позавчера").map(() => {
        const d = new Date();
        d.setDate(d.getDate() - 2);
        return d;
      }),
      P.digits
        .skip(P.optWhitespace.then(P.regexp(/дн(я|ей) назад/)))
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
        language.amountOfMoney,
        P.whitespace.then(language.comment).fallback(undefined),
        (date, category, _, amountOfMoney, comment) =>
          new Transaction(category, amountOfMoney, comment, date)
      ),
      P.seqMap(
        language.date.skip(P.whitespace).fallback(undefined),
        language.amountOfMoney,
        P.whitespace,
        language.category,
        P.whitespace.then(language.comment).fallback(undefined),
        (date, amountOfMoney, _, category, comment) =>
          new Transaction(category, amountOfMoney, comment, date)
      )
    ),
});

import { TransactionParser } from "../../src/parser/index";
import {
  equal,
  strictEqual,
  deepStrictEqual,
  notDeepStrictEqual,
  notDeepEqual,
  deepEqual,
} from "assert";
import { Transaction } from "../../src/model";
import { Success } from "parsimmon";

describe("transaction parser ", () => {
  it("can parse categories", () => {
    const parsedValueProducts = TransactionParser.category.parse("продукты");
    const parsedValueSalary = TransactionParser.category.parse("зарплата");
    const wrongParsedValueGold = TransactionParser.category.parse("золото");

    deepStrictEqual(parsedValueProducts, { status: true, value: "продукты" });
    deepStrictEqual(parsedValueSalary, { status: true, value: "зарплата" });
    notDeepStrictEqual(parsedValueSalary, { status: true, value: "золото" });
  });

  it("can parse amount of money", () => {
    const parsedDigitsValue = TransactionParser.amountOfMoney.parse("44112");
    const parsedFloatValue =
      TransactionParser.amountOfMoney.parse("44112.3123");
    const wrongParsedDigitsValue =
      TransactionParser.amountOfMoney.parse("aa44112aa");

    deepStrictEqual(parsedDigitsValue, { status: true, value: 44112 });
    deepStrictEqual(parsedFloatValue, { status: true, value: 44112.3123 });
    notDeepStrictEqual(wrongParsedDigitsValue, {
      status: true,
      value: "aa44112aa",
    });
  });

  it("can parse date",()=>{
    const d1:Date= TransactionParser.date.tryParse("вчера");
    strictEqual(d1.getDay(),new Date().getDay()-1)
    const d3:Date= TransactionParser.date.tryParse("3 дня назад");
    strictEqual(d3.getDay(),new Date().getDay()-3)
    //console.log('TransactionParser.date.parse("2 дня назад")',)  
  //  console.log('Transactiob.date.parse("вчера)"', TransactionParser.date.parse("позавчера"))
   // deepStrictEqual()
  })

  it("can parse transaction", () => {
    const parsedValue = TransactionParser.transaction.parse("продукты 123.23");

    deepStrictEqual(
      parsedValue,

      {
        status: true,
        value: new Transaction("продукты", 123.23),
      }
    );

    const secondParsedValue =
      TransactionParser.transaction.parse("123.23 зарплата");

    deepStrictEqual(
      secondParsedValue,

      {
        status: true,
        value: new Transaction("зарплата", 123.23),
      }
    );

 
    deepStrictEqual(
     TransactionParser.transaction.parse("123.23 рублей зарплата"),

      {
        status: true,
        value: new Transaction("зарплата", 123.23),
      }
    );
  });

  it("can parse transaction with comment", () => {
    deepStrictEqual(
      TransactionParser.transaction.parse("продукты 123.23 овощи"),

      {
        status: true,
        value: new Transaction("продукты", 123.23, "овощи"),
      }
    );

    deepStrictEqual(
      TransactionParser.transaction.parse("123.23 р зарплата за работу"),

      {
        status: true,
        value: new Transaction("зарплата", 123.23, "за работу"),
      }
    );
  });


  it("can parse transaction with comment and date", () => {

    const t1=TransactionParser.transaction.parse("вчера продукты 123.23 овощи")

    deepStrictEqual(
      (t1 as Success<Transaction>)?.value?.date?.getDate(),

      new Date().getDate()-1
    );

    deepStrictEqual(
      TransactionParser.transaction.parse("123.23 р зарплата за работу"),

      {
        status: true,
        value: new Transaction("зарплата", 123.23, "за работу"),
      }
    );
  });






});

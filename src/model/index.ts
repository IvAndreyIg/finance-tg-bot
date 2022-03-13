export class Transaction {
  constructor(
    public category: string,
    public amountOfMoney: Number,
    public comment?: string,
    public date?: Date
  ) {}
}

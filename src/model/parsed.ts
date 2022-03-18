export class ParsedTransaction {
  constructor(
    public category: string,
    public amountOfMoney: number,
    public comment?: string,
    public date?: Date
  ) {}
}

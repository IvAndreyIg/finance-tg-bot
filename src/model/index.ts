export class Transaction {
  constructor(
    public date: Date,
    public user: string,
    public type: string,
    public category: string,
    public amount: number,
    public comment?: string
  ) {}
}

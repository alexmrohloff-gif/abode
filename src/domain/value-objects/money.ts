export class Money {
  readonly amountCents: number;
  readonly currency: string;

  constructor(amountCents: number, currency: string) {
    this.amountCents = amountCents;
    this.currency = currency;
  }

  add(other: Money): Money {
    if (other.currency !== this.currency) {
      throw new Error("Currency mismatch");
    }
    return new Money(this.amountCents + other.amountCents, this.currency);
  }
}

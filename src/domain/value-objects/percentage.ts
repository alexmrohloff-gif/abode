export class Percentage {
  readonly value: number;

  constructor(value: number) {
    if (value < 0 || value > 100) {
      throw new Error("Percentage must be between 0 and 100");
    }
    this.value = value;
  }
}

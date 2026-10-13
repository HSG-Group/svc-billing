/**
 * Money value object.
 * Stores amounts as integer minor units (e.g. cents) to avoid floating point errors.
 */
export class Money {
  private readonly amountMinorUnits: number;
  private readonly currency: string;

  private constructor(amountMinorUnits: number, currency: string) {
    if (!Number.isInteger(amountMinorUnits)) {
      throw new Error(
        'Money amount must be an integer number of minor units (e.g. cents)',
      );
    }
    if (amountMinorUnits < 0) {
      throw new Error('Money amount cannot be negative');
    }
    if (!/^[A-Z]{3}$/.test(currency)) {
      throw new Error(`Invalid currency code: ${currency}`);
    }

    this.amountMinorUnits = amountMinorUnits;
    this.currency = currency;
  }

  static fromMinorUnits(amount: number, currency: string): Money {
    return new Money(amount, currency.toUpperCase());
  }

  static fromDecimal(amount: number, currency: string): Money {
    return new Money(Math.round(amount * 100), currency.toUpperCase());
  }

  static zero(currency: string): Money {
    return new Money(0, currency.toUpperCase());
  }

  getAmountMinorUnits(): number {
    return this.amountMinorUnits;
  }

  getAmountDecimal(): number {
    return this.amountMinorUnits / 100;
  }

  getCurrency(): string {
    return this.currency;
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(
      this.amountMinorUnits + other.amountMinorUnits,
      this.currency,
    );
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(
      this.amountMinorUnits - other.amountMinorUnits,
      this.currency,
    );
  }

  equals(other: Money): boolean {
    return (
      this.amountMinorUnits === other.amountMinorUnits &&
      this.currency === other.currency
    );
  }

  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amountMinorUnits > other.amountMinorUnits;
  }

  toString(): string {
    return `${this.getAmountDecimal().toFixed(2)} ${this.currency}`;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(
        `Currency mismatch: ${this.currency} vs ${other.currency}`,
      );
    }
  }
}

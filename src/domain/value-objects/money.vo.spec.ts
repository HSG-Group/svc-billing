import { Money } from './money.vo';

describe('Money VO', () => {
  it('creates money from minor units', () => {
    const m = Money.fromMinorUnits(1999, 'usd');
    expect(m.getAmountMinorUnits()).toBe(1999);
    expect(m.getCurrency()).toBe('USD');
    expect(m.getAmountDecimal()).toBe(19.99);
  });

  it('creates money from decimal amount', () => {
    const m = Money.fromDecimal(19.99, 'USD');
    expect(m.getAmountMinorUnits()).toBe(1999);
  });

  it('rejects negative amounts', () => {
    expect(() => Money.fromMinorUnits(-1, 'USD')).toThrow();
  });

  it('rejects invalid currency codes', () => {
    expect(() => Money.fromMinorUnits(100, 'US')).toThrow();
  });

  it('adds two amounts with the same currency', () => {
    const a = Money.fromMinorUnits(100, 'USD');
    const b = Money.fromMinorUnits(250, 'USD');
    expect(a.add(b).getAmountMinorUnits()).toBe(350);
  });

  it('throws when adding different currencies', () => {
    const a = Money.fromMinorUnits(100, 'USD');
    const b = Money.fromMinorUnits(100, 'EUR');
    expect(() => a.add(b)).toThrow(/Currency mismatch/);
  });
});

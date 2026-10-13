import { BillingInterval, Plan } from './plan.vo';
import { Money } from './money.vo';

describe('Plan VO', () => {
  it('hasTrial returns true when trialPeriodDays > 0', () => {
    const p = Plan.create({
      id: 'p1',
      name: 'Starter',
      price: Money.fromDecimal(19, 'USD'),
      interval: BillingInterval.MONTHLY,
      trialPeriodDays: 14,
    });
    expect(p.hasTrial()).toBe(true);
  });

  it('hasTrial returns false when no trial is provided', () => {
    const p = Plan.create({
      id: 'p2',
      name: 'Pro',
      price: Money.fromDecimal(99, 'USD'),
      interval: BillingInterval.MONTHLY,
    });
    expect(p.hasTrial()).toBe(false);
    expect(p.trialPeriodDays).toBe(0);
  });

  it('equality is based on plan id', () => {
    const a = Plan.create({
      id: 'x',
      name: 'A',
      price: Money.fromDecimal(1, 'USD'),
      interval: BillingInterval.MONTHLY,
    });
    const b = Plan.create({
      id: 'x',
      name: 'B',
      price: Money.fromDecimal(2, 'USD'),
      interval: BillingInterval.YEARLY,
    });
    expect(a.equals(b)).toBe(true);
  });
});

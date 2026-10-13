import { Subscription, SubscriptionStatus } from './subscription.entity';
import { BillingInterval, Plan } from '../value-objects/plan.vo';
import { Money } from '../value-objects/money.vo';
import {
  SubscriptionCancelledEvent,
  SubscriptionCreatedEvent,
  SubscriptionPlanChangedEvent,
} from './subscription.events';

const makePlan = (opts: { trial?: number } = {}) =>
  Plan.create({
    id: 'starter-monthly',
    name: 'Starter',
    price: Money.fromDecimal(19, 'USD'),
    interval: BillingInterval.MONTHLY,
    trialPeriodDays: opts.trial,
  });

describe('Subscription aggregate', () => {
  it('is created in TRIALING status when the plan has a trial', () => {
    const s = Subscription.create({
      id: 's1',
      customerId: 'c1',
      plan: makePlan({ trial: 14 }),
    });
    expect(s.status).toBe(SubscriptionStatus.TRIALING);
    expect(s.pullDomainEvents()[0]).toBeInstanceOf(SubscriptionCreatedEvent);
  });

  it('is created in ACTIVE status when the plan has no trial', () => {
    const s = Subscription.create({
      id: 's1',
      customerId: 'c1',
      plan: makePlan(),
    });
    expect(s.status).toBe(SubscriptionStatus.ACTIVE);
  });

  it('cancel() raises an event and updates the status', () => {
    const s = Subscription.create({
      id: 's1',
      customerId: 'c1',
      plan: makePlan(),
    });
    s.pullDomainEvents();
    s.cancel('user requested');
    expect(s.status).toBe(SubscriptionStatus.CANCELLED);
    const [e] = s.pullDomainEvents();
    expect(e).toBeInstanceOf(SubscriptionCancelledEvent);
  });

  it('calling cancel() twice does not emit a second event', () => {
    const s = Subscription.create({
      id: 's1',
      customerId: 'c1',
      plan: makePlan(),
    });
    s.cancel();
    s.pullDomainEvents();
    s.cancel();
    expect(s.pullDomainEvents()).toHaveLength(0);
  });

  it('changePlan() raises a PlanChanged event', () => {
    const s = Subscription.create({
      id: 's1',
      customerId: 'c1',
      plan: makePlan(),
    });
    s.pullDomainEvents();
    const newPlan = Plan.create({
      id: 'pro-monthly',
      name: 'Pro',
      price: Money.fromDecimal(99, 'USD'),
      interval: BillingInterval.MONTHLY,
    });
    s.changePlan(newPlan);
    const events = s.pullDomainEvents();
    expect(events[0]).toBeInstanceOf(SubscriptionPlanChangedEvent);
    expect(s.plan.id).toBe('pro-monthly');
  });

  it('rejects changePlan() on a cancelled subscription', () => {
    const s = Subscription.create({
      id: 's1',
      customerId: 'c1',
      plan: makePlan(),
    });
    s.cancel();
    expect(() => s.changePlan(makePlan())).toThrow(/cancelled/);
  });

  it('renewPeriod() moves currentPeriodEnd one month forward', () => {
    const s = Subscription.create({
      id: 's1',
      customerId: 'c1',
      plan: makePlan(),
    });
    const before = new Date(s.currentPeriodEnd).getTime();
    s.renewPeriod();
    expect(new Date(s.currentPeriodEnd).getTime()).toBeGreaterThan(before);
  });
});

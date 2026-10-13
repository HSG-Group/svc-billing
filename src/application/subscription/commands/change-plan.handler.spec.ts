import { EventBus } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { ChangePlanHandler } from './change-plan.handler';
import { ChangePlanCommand } from './change-plan.command';
import { SubscriptionRepository } from '../../../infrastructure/persistence/repositories/subscription.repository';
import { Subscription } from '../../../domain/subscription/subscription.entity';
import { BillingInterval, Plan } from '../../../domain/value-objects/plan.vo';
import { Money } from '../../../domain/value-objects/money.vo';

describe('ChangePlanHandler', () => {
  let handler: ChangePlanHandler;
  let repo: SubscriptionRepository;
  let eventBus: EventBus;

  beforeEach(async () => {
    repo = new SubscriptionRepository();
    eventBus = { publish: jest.fn() } as unknown as EventBus;
    handler = new ChangePlanHandler(repo, eventBus);
    const s = Subscription.create({
      id: 's1',
      customerId: 'c1',
      plan: Plan.create({
        id: 'starter-monthly',
        name: 'Starter',
        price: Money.fromDecimal(19, 'USD'),
        interval: BillingInterval.MONTHLY,
      }),
    });
    s.pullDomainEvents();
    await repo.save(s);
  });

  it('đổi plan starter → pro', async () => {
    await handler.execute(new ChangePlanCommand('s1', 'pro', 'monthly'));
    const s = await repo.findById('s1');
    expect(s!.plan.id).toBe('pro-monthly');
  });

  it('ném lỗi khi plan mới không tồn tại', async () => {
    await expect(
      handler.execute(new ChangePlanCommand('s1', 'gold', 'monthly')),
    ).rejects.toThrow(NotFoundException);
  });
});

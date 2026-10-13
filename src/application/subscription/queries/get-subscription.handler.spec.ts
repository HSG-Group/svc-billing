import { NotFoundException } from '@nestjs/common';
import { GetSubscriptionHandler } from './get-subscription.handler';
import { GetSubscriptionQuery } from './get-subscription.query';
import { SubscriptionRepository } from '../../../infrastructure/persistence/repositories/subscription.repository';
import { Subscription } from '../../../domain/subscription/subscription.entity';
import { BillingInterval, Plan } from '../../../domain/value-objects/plan.vo';
import { Money } from '../../../domain/value-objects/money.vo';

describe('GetSubscriptionHandler', () => {
  let handler: GetSubscriptionHandler;
  let repo: SubscriptionRepository;

  beforeEach(async () => {
    repo = new SubscriptionRepository();
    handler = new GetSubscriptionHandler(repo);
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

  it('trả về read model đúng shape', async () => {
    const result = await handler.execute(new GetSubscriptionQuery('s1'));
    expect(result).toMatchObject({
      id: 's1',
      customerId: 'c1',
      plan: { id: 'starter-monthly', name: 'Starter', interval: 'monthly' },
    });
  });

  it('ném NotFoundException khi không tồn tại', async () => {
    await expect(
      handler.execute(new GetSubscriptionQuery('nope')),
    ).rejects.toThrow(NotFoundException);
  });
});

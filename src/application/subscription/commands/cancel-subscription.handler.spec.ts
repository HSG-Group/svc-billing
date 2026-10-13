import { EventBus } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CancelSubscriptionHandler } from './cancel-subscription.handler';
import { CancelSubscriptionCommand } from './cancel-subscription.command';
import { SubscriptionRepository } from '../../../infrastructure/persistence/repositories/subscription.repository';
import {
  Subscription,
  SubscriptionStatus,
} from '../../../domain/subscription/subscription.entity';
import { BillingInterval, Plan } from '../../../domain/value-objects/plan.vo';
import { Money } from '../../../domain/value-objects/money.vo';

const seed = async (repo: SubscriptionRepository) => {
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
};

describe('CancelSubscriptionHandler', () => {
  let handler: CancelSubscriptionHandler;
  let repo: SubscriptionRepository;
  let eventBus: EventBus;

  beforeEach(() => {
    repo = new SubscriptionRepository();
    eventBus = { publish: jest.fn() } as unknown as EventBus;
    handler = new CancelSubscriptionHandler(repo, eventBus);
  });

  it('cancel subscription thành công', async () => {
    await seed(repo);
    await handler.execute(new CancelSubscriptionCommand('s1', 'test'));
    const s = await repo.findById('s1');
    expect(s!.status).toBe(SubscriptionStatus.CANCELLED);
    expect(eventBus.publish).toHaveBeenCalled();
  });

  it('ném NotFoundException khi không có subscription', async () => {
    await expect(
      handler.execute(new CancelSubscriptionCommand('missing')),
    ).rejects.toThrow(NotFoundException);
  });
});

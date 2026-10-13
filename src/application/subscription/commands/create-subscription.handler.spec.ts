import { EventBus } from '@nestjs/cqrs';
import { CreateSubscriptionHandler } from './create-subscription.handler';
import { CreateSubscriptionCommand } from './create-subscription.command';
import { SubscriptionRepository } from '../../../infrastructure/persistence/repositories/subscription.repository';
import type { PaymentGatewayInterface } from '../../ports/payment-gateway.interface';

describe('CreateSubscriptionHandler', () => {
  let handler: CreateSubscriptionHandler;
  let repo: SubscriptionRepository;
  let eventBus: EventBus;
  let gateway: jest.Mocked<PaymentGatewayInterface>;

  beforeEach(() => {
    repo = new SubscriptionRepository();
    eventBus = { publish: jest.fn() } as unknown as EventBus;
    gateway = {
      attachPaymentMethod: jest
        .fn()
        .mockResolvedValue({ externalCustomerId: 'cus_1' }),
      charge: jest.fn(),
      cancelExternalSubscription: jest.fn(),
    };
    handler = new CreateSubscriptionHandler(repo, gateway, eventBus);
  });

  it('creates a subscription and calls the payment gateway', async () => {
    const cmd = new CreateSubscriptionCommand(
      'c1',
      'starter',
      'pm_1',
      'monthly',
    );
    const { subscriptionId } = await handler.execute(cmd);

    expect(subscriptionId).toBeDefined();
    expect(gateway.attachPaymentMethod).toHaveBeenCalledWith('c1', 'pm_1');

    const saved = await repo.findById(subscriptionId);
    expect(saved).not.toBeNull();
    expect(eventBus.publish).toHaveBeenCalled();
  });

  it('throws when the plan does not exist', async () => {
    const cmd = new CreateSubscriptionCommand(
      'c1',
      'nonexistent',
      'pm_1',
      'monthly',
    );
    await expect(handler.execute(cmd)).rejects.toThrow(/Unknown plan/);
    expect(gateway.attachPaymentMethod).not.toHaveBeenCalled();
  });
});

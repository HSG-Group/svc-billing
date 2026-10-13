import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';

import { Subscription } from '../../../domain/subscription/subscription.entity';
import { BillingInterval, Plan } from '../../../domain/value-objects/plan.vo';
import { Money } from '../../../domain/value-objects/money.vo';
import { SUBSCRIPTION_REPOSITORY } from '../../../domain/repositories/subscription.repository.interface';
import type { SubscriptionRepositoryInterface } from '../../../domain/repositories/subscription.repository.interface';
import { PAYMENT_GATEWAY } from '../../ports/payment-gateway.interface';
import type { PaymentGatewayInterface } from '../../ports/payment-gateway.interface';
import { CreateSubscriptionCommand } from './create-subscription.command';

/**
 * Demo plan catalog. In a real system this would be backed by its own
 * repository/config service rather than hardcoded here.
 */
const PLAN_CATALOG: Record<string, (interval: BillingInterval) => Plan> = {
  starter: (interval) =>
    Plan.create({
      id: `starter-${interval}`,
      name: 'Starter',
      price: Money.fromDecimal(
        interval === BillingInterval.YEARLY ? 190 : 19,
        'USD',
      ),
      interval,
      trialPeriodDays: 14,
    }),
  pro: (interval) =>
    Plan.create({
      id: `pro-${interval}`,
      name: 'Pro',
      price: Money.fromDecimal(
        interval === BillingInterval.YEARLY ? 990 : 99,
        'USD',
      ),
      interval,
    }),
};

@CommandHandler(CreateSubscriptionCommand)
export class CreateSubscriptionHandler implements ICommandHandler<CreateSubscriptionCommand> {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepositoryInterface,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGatewayInterface,
    private readonly eventBus: EventBus,
  ) {}

  async execute(
    command: CreateSubscriptionCommand,
  ): Promise<{ subscriptionId: string }> {
    const planFactory = PLAN_CATALOG[command.planId];
    if (!planFactory) {
      throw new NotFoundException(`Unknown plan: ${command.planId}`);
    }
    const interval =
      command.interval === 'yearly'
        ? BillingInterval.YEARLY
        : BillingInterval.MONTHLY;
    const plan = planFactory(interval);

    // Attach the payment method with the external payment provider first,
    // so we never persist a subscription we can't actually bill.
    await this.paymentGateway.attachPaymentMethod(
      command.customerId,
      command.paymentMethodId,
    );

    const subscription = Subscription.create({
      id: randomUUID(),
      customerId: command.customerId,
      plan,
    });

    await this.subscriptionRepository.save(subscription);

    for (const event of subscription.pullDomainEvents()) {
      this.eventBus.publish(event);
    }

    return { subscriptionId: subscription.id };
  }
}

import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BillingInterval, Plan } from '../../../domain/value-objects/plan.vo';
import { Money } from '../../../domain/value-objects/money.vo';
import {
  SUBSCRIPTION_REPOSITORY,
  type SubscriptionRepositoryInterface,
} from '../../../domain/repositories/subscription.repository.interface';
import { ChangePlanCommand } from './change-plan.command';

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

@CommandHandler(ChangePlanCommand)
export class ChangePlanHandler implements ICommandHandler<ChangePlanCommand> {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepositoryInterface,
    private readonly eventBus: EventBus,
  ) {}
  async execute(command: ChangePlanCommand): Promise<void> {
    const subscription = await this.subscriptionRepository.findById(
      command.subscriptionId,
    );
    if (!subscription) {
      throw new NotFoundException(
        `Subscription not found: ${command.subscriptionId}`,
      );
    }
    const planFactory = PLAN_CATALOG[command.newPlanId];
    if (!planFactory) {
      throw new NotFoundException(`Unknown plan: ${command.newPlanId}`);
    }
    const interval =
      command.interval === 'yearly'
        ? BillingInterval.YEARLY
        : BillingInterval.MONTHLY;
    const newPlan = planFactory(interval);
    subscription.changePlan(newPlan);
    await this.subscriptionRepository.save(subscription);
    for (const event of subscription.pullDomainEvents()) {
      this.eventBus.publish(event);
    }
  }
}

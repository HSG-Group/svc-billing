import {
  Subscription,
  SubscriptionStatus,
} from '../../../domain/subscription/subscription.entity';
import { BillingInterval, Plan } from '../../../domain/value-objects/plan.vo';
import { Money } from '../../../domain/value-objects/money.vo';
import { SubscriptionEntity } from '../entities/subscription.entity';

export class SubscriptionMapper {
  static toDomain(this: void, entity: SubscriptionEntity): Subscription {
    const plan = Plan.create({
      id: entity.planId,
      name: entity.planName,
      price: Money.fromMinorUnits(
        entity.planAmountMinorUnits,
        entity.planCurrency,
      ),
      interval: entity.planInterval as BillingInterval,
      trialPeriodDays: entity.planTrialPeriodDays,
    });

    return Subscription.reconstitute({
      id: entity.id,
      customerId: entity.customerId,
      plan,
      status: entity.status as SubscriptionStatus,
      currentPeriodEnd: entity.currentPeriodEnd,
      cancelAtPeriodEnd: entity.cancelAtPeriodEnd,
      createdAt: entity.createdAt,
    });
  }

  static toPersistence(
    this: void,
    subscription: Subscription,
  ): SubscriptionEntity {
    const entity = new SubscriptionEntity();
    entity.id = subscription.id;
    entity.customerId = subscription.customerId;
    entity.planId = subscription.plan.id;
    entity.planName = subscription.plan.name;
    entity.planAmountMinorUnits = subscription.plan.price.getAmountMinorUnits();
    entity.planCurrency = subscription.plan.price.getCurrency();
    entity.planInterval = subscription.plan.interval;
    entity.planTrialPeriodDays = subscription.plan.trialPeriodDays;
    entity.status = subscription.status;
    entity.currentPeriodEnd = subscription.currentPeriodEnd;
    entity.cancelAtPeriodEnd = subscription.cancelAtPeriodEnd;
    entity.createdAt = subscription.createdAt;
    return entity;
  }
}

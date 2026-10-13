import { NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SUBSCRIPTION_REPOSITORY } from '../../../domain/repositories/subscription.repository.interface';
import type { SubscriptionRepositoryInterface } from '../../../domain/repositories/subscription.repository.interface';
import { GetSubscriptionQuery } from './get-subscription.query';

@QueryHandler(GetSubscriptionQuery)
export class GetSubscriptionHandler implements IQueryHandler<GetSubscriptionQuery> {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepositoryInterface,
  ) {}

  async execute(query: GetSubscriptionQuery) {
    const subscription = await this.subscriptionRepository.findById(
      query.subscriptionId,
    );
    if (!subscription) {
      throw new NotFoundException(
        `Subscription not found: ${query.subscriptionId}`,
      );
    }

    // Map Aggregate Root sang DTO Read Model
    return {
      id: subscription.id,
      customerId: subscription.customerId,
      status: subscription.status,
      plan: {
        id: subscription.plan.id,
        name: subscription.plan.name,
        price: subscription.plan.price.toString(),
        interval: subscription.plan.interval,
      },
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      createdAt: subscription.createdAt,
    };
  }
}

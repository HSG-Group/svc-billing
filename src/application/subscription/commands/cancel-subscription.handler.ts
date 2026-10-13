import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { SUBSCRIPTION_REPOSITORY } from '../../../domain/repositories/subscription.repository.interface';
import type { SubscriptionRepositoryInterface } from '../../../domain/repositories/subscription.repository.interface';
import { CancelSubscriptionCommand } from './cancel-subscription.command';

@CommandHandler(CancelSubscriptionCommand)
export class CancelSubscriptionHandler implements ICommandHandler<CancelSubscriptionCommand> {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepositoryInterface,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CancelSubscriptionCommand): Promise<void> {
    const subscription = await this.subscriptionRepository.findById(
      command.subscriptionId,
    );
    if (!subscription) {
      throw new NotFoundException(
        `Subscription not found: ${command.subscriptionId}`,
      );
    }
    subscription.cancel(command.reason);
    await this.subscriptionRepository.save(subscription);
    for (const event of subscription.pullDomainEvents()) {
      this.eventBus.publish(event);
    }
  }
}

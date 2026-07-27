import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { SubscriptionController } from '../application/subscription/subscription.controller';
import { CreateSubscriptionHandler } from '../application/subscription/commands/create-subscription.handler';
import { SUBSCRIPTION_REPOSITORY } from '../domain/repositories/subscription.repository.interface';
import { SubscriptionRepository } from '../infrastructure/persistence/repositories/subscription.repository';
import { StripeModule } from './stripe.module';

const CommandHandlers = [CreateSubscriptionHandler];

@Module({
  imports: [CqrsModule, StripeModule],
  controllers: [SubscriptionController],
  providers: [
    ...CommandHandlers,
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: SubscriptionRepository,
    },
  ],
})
export class SubscriptionModule {}

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { SubscriptionController } from '../application/subscription/subscription.controller';
import { CreateSubscriptionHandler } from '../application/subscription/commands/create-subscription.handler';
import { SUBSCRIPTION_REPOSITORY } from '../domain/repositories/subscription.repository.interface';
import { SubscriptionRepository } from '../infrastructure/persistence/repositories/subscription.repository';
import { StripeModule } from './stripe.module';
import { CancelSubscriptionHandler } from 'src/application/subscription/commands/cancel-subscription.handler';
import { ChangePlanHandler } from 'src/application/subscription/commands/change-plan.handler';
import { GetSubscriptionHandler } from 'src/application/subscription/queries/get-subscription.handler';

const CommandHandlers = [
  CreateSubscriptionHandler,
  CancelSubscriptionHandler,
  ChangePlanHandler,
];
const QueryHandlers = [GetSubscriptionHandler];
@Module({
  imports: [CqrsModule, StripeModule],
  controllers: [SubscriptionController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: SubscriptionRepository,
    },
  ],
})
export class SubscriptionModule {}

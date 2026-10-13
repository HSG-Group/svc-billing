import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { SubscriptionController } from '../application/subscription/subscription.controller';
import { CreateSubscriptionHandler } from '../application/subscription/commands/create-subscription.handler';
import { CancelSubscriptionHandler } from '../application/subscription/commands/cancel-subscription.handler';
import { ChangePlanHandler } from '../application/subscription/commands/change-plan.handler';
import { GetSubscriptionHandler } from '../application/subscription/queries/get-subscription.handler';
import { StripeModule } from './stripe.module';
import { PersistenceModule } from '../infrastructure/persistence/persistence.module';

const CommandHandlers = [
  CreateSubscriptionHandler,
  CancelSubscriptionHandler,
  ChangePlanHandler,
];
const QueryHandlers = [GetSubscriptionHandler];
@Module({
  imports: [CqrsModule, StripeModule, PersistenceModule],
  controllers: [SubscriptionController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class SubscriptionModule {}

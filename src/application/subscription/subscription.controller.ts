import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { CreateSubscriptionDto } from '../dtos/create-subscription.dto';
import { CreateSubscriptionCommand } from './commands/create-subscription.command';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async create(@Body() dto: CreateSubscriptionDto): Promise<{ subscriptionId: string }> {
    return this.commandBus.execute(
      new CreateSubscriptionCommand(dto.customerId, dto.planId, dto.paymentMethodId, dto.interval),
    );
  }
}

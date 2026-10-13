import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateSubscriptionDto } from '../dtos/create-subscription.dto';
import { CancelSubscriptionDto } from '../dtos/cancel-subscription.dto';
import { ChangePlanDto } from '../dtos/change-plan.dto';
import { CreateSubscriptionCommand } from './commands/create-subscription.command';
import { CancelSubscriptionCommand } from './commands/cancel-subscription.command';
import { ChangePlanCommand } from './commands/change-plan.command';
import { GetSubscriptionQuery } from './queries/get-subscription.query';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateSubscriptionDto,
  ): Promise<{ subscriptionId: string }> {
    return this.commandBus.execute<
      CreateSubscriptionCommand,
      { subscriptionId: string }
    >(
      new CreateSubscriptionCommand(
        dto.customerId,
        dto.planId,
        dto.paymentMethodId,
        dto.interval,
      ),
    );
  }
  @Get(':id')
  async getById(@Param('id') id: string): Promise<unknown> {
    return this.queryBus.execute<GetSubscriptionQuery, unknown>(
      new GetSubscriptionQuery(id),
    );
  }
  @Delete(':id')
  async cancel(@Param('id') id: string, @Body() dto: CancelSubscriptionDto) {
    await this.commandBus.execute(
      new CancelSubscriptionCommand(id, dto.reason),
    );
    return { success: true };
  }
  @Patch(':id/plan')
  async changePlan(@Param('id') id: string, @Body() dto: ChangePlanDto) {
    await this.commandBus.execute(
      new ChangePlanCommand(id, dto.newPlanId, dto.interval),
    );
    return { success: true };
  }
}

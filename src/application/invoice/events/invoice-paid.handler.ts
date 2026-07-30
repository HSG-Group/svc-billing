import { Inject, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InvoicePaidEvent } from 'src/domain/invoice/invoice.events';
import { SUBSCRIPTION_REPOSITORY } from 'src/domain/repositories/subscription.repository.interface';
import type { SubscriptionRepositoryInterface } from 'src/domain/repositories/subscription.repository.interface';

@EventsHandler(InvoicePaidEvent)
export class InvoicePaidEventHandler implements IEventHandler<InvoicePaidEvent> {
  private readonly logger = new Logger(InvoicePaidEventHandler.name);

  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepositoryInterface,
  ) {}

  async handle(event: InvoicePaidEvent): Promise<void> {
    this.logger.log(`Handling InvoicePaidEvent for invoice ${event.invoiceId}`);
  }
}

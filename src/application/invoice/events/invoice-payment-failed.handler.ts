import { Inject, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InvoicePaymentFailedEvent } from '../../../domain/invoice/invoice.events';
import { SUBSCRIPTION_REPOSITORY } from '../../../domain/repositories/subscription.repository.interface';
import type { SubscriptionRepositoryInterface } from '../../../domain/repositories/subscription.repository.interface';

@EventsHandler(InvoicePaymentFailedEvent)
export class InvoicePaymentFailedEventHandler implements IEventHandler<InvoicePaymentFailedEvent> {
  private readonly logger = new Logger(InvoicePaymentFailedEventHandler.name);

  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepositoryInterface,
  ) {}

  handle(event: InvoicePaymentFailedEvent): void {
    this.logger.warn(
      `Payment failed for invoice ${event.invoiceId}: ${event.reason}`,
    );
  }
}

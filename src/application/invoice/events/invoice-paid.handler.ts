import { Inject, Logger } from '@nestjs/common';
import { EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InvoiceStatus } from 'src/domain/invoice/invoice.entity';
import { InvoicePaidEvent } from 'src/domain/invoice/invoice.events';
import {
  INVOICE_REPOSITORY,
  type InvoiceRepositoryInterface,
} from 'src/domain/repositories/invoice.repository.interface';
import { SUBSCRIPTION_REPOSITORY } from 'src/domain/repositories/subscription.repository.interface';
import type { SubscriptionRepositoryInterface } from 'src/domain/repositories/subscription.repository.interface';
import { SubscriptionStatus } from 'src/domain/subscription/subscription.entity';

@EventsHandler(InvoicePaidEvent)
export class InvoicePaidEventHandler implements IEventHandler<InvoicePaidEvent> {
  private readonly logger = new Logger(InvoicePaidEventHandler.name);

  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepositoryInterface,
    @Inject(INVOICE_REPOSITORY)
    private readonly invoiceRepository: InvoiceRepositoryInterface,
    private readonly eventBus: EventBus,
  ) {}

  async handle(event: InvoicePaidEvent): Promise<void> {
    const invoice = await this.invoiceRepository.findById(event.invoiceId);
    if (!invoice) {
      this.logger.error(`Invoice not found for ID: ${event.invoiceId}`);
      return;
    }
    if (invoice.status !== InvoiceStatus.PAID) {
      invoice.markPaid();
      await this.invoiceRepository.save(invoice);
    }
    const subscription = await this.subscriptionRepository.findById(
      invoice.subscriptionId,
    );
    if (!subscription) {
      this.logger.error(
        `Subscription ${invoice.subscriptionId} not found for invoice ${invoice.id}`,
      );
      return;
    }
    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      subscription.activate();
    }
    subscription.renewPeriod();
    await this.subscriptionRepository.save(subscription);

    for (const domainEvent of subscription.pullDomainEvents()) {
      this.eventBus.publish(domainEvent);
    }
    this.logger.log(
      `Successfully renewed subscription ${subscription.id}. New period end: ${subscription.currentPeriodEnd.toISOString()}`,
    );
  }
}

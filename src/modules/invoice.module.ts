import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { INVOICE_REPOSITORY } from 'src/domain/repositories/invoice.repository.interface';
import { InvoiceRepository } from 'src/infrastructure/persistence/repositories/invoice.repository';
import { InvoicePaidEventHandler } from 'src/application/invoice/events/invoice-paid.handler';
import { InvoicePaymentFailedEventHandler } from 'src/application/invoice/events/invoice-payment-failed.handler';
import { SubscriptionModule } from './subscription.module';

@Module({
  imports: [CqrsModule, SubscriptionModule],
  providers: [
    InvoicePaidEventHandler,
    InvoicePaymentFailedEventHandler,
    {
      provide: INVOICE_REPOSITORY,
      useClass: InvoiceRepository,
    },
  ],
  exports: [INVOICE_REPOSITORY],
})
export class InvoiceModule {}

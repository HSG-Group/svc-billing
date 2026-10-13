import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { InvoicePaidEventHandler } from '../application/invoice/events/invoice-paid.handler';
import { InvoicePaymentFailedEventHandler } from '../application/invoice/events/invoice-payment-failed.handler';
import { PersistenceModule } from '../infrastructure/persistence/persistence.module';
@Module({
  imports: [CqrsModule, PersistenceModule],
  providers: [InvoicePaidEventHandler, InvoicePaymentFailedEventHandler],
})
export class InvoiceModule {}

import { DomainEvent } from '../subscription/subscription.events';

export class InvoiceIssuedEvent extends DomainEvent {
  constructor(
    readonly invoiceId: string,
    readonly subscriptionId: string,
    readonly amountMinorUnits: number,
    readonly currency: string,
  ) {
    super();
  }
}

export class InvoicePaidEvent extends DomainEvent {
  constructor(
    readonly invoiceId: string,
    readonly paidAt: Date,
  ) {
    super();
  }
}

export class InvoicePaymentFailedEvent extends DomainEvent {
  constructor(
    readonly invoiceId: string,
    readonly reason: string,
  ) {
    super();
  }
}

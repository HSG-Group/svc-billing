import { Money } from '../value-objects/money.vo';
import { DomainEvent } from '../subscription/subscription.events';
import { InvoiceIssuedEvent, InvoicePaidEvent, InvoicePaymentFailedEvent } from './invoice.events';

export enum InvoiceStatus {
  OPEN = 'open',
  PAID = 'paid',
  FAILED = 'failed',
  VOID = 'void',
}

export interface InvoiceProps {
  id: string;
  subscriptionId: string;
  amount: Money;
  status: InvoiceStatus;
  issuedAt: Date;
  paidAt: Date | null;
}

/**
 * Invoice entity.
 * Represents a single billing cycle's charge for a subscription.
 */
export class Invoice {
  private readonly _id: string;
  private readonly _subscriptionId: string;
  private readonly _amount: Money;
  private _status: InvoiceStatus;
  private readonly _issuedAt: Date;
  private _paidAt: Date | null;
  private readonly _domainEvents: DomainEvent[] = [];

  private constructor(props: InvoiceProps) {
    this._id = props.id;
    this._subscriptionId = props.subscriptionId;
    this._amount = props.amount;
    this._status = props.status;
    this._issuedAt = props.issuedAt;
    this._paidAt = props.paidAt;
  }

  static issue(params: { id: string; subscriptionId: string; amount: Money }): Invoice {
    const invoice = new Invoice({
      id: params.id,
      subscriptionId: params.subscriptionId,
      amount: params.amount,
      status: InvoiceStatus.OPEN,
      issuedAt: new Date(),
      paidAt: null,
    });

    invoice.record(
      new InvoiceIssuedEvent(params.id, params.subscriptionId, params.amount.getAmountMinorUnits(), params.amount.getCurrency()),
    );

    return invoice;
  }

  static reconstitute(props: InvoiceProps): Invoice {
    return new Invoice(props);
  }

  markPaid(): void {
    if (this._status === InvoiceStatus.PAID) {
      return;
    }
    this._status = InvoiceStatus.PAID;
    this._paidAt = new Date();
    this.record(new InvoicePaidEvent(this._id, this._paidAt));
  }

  markFailed(reason: string): void {
    this._status = InvoiceStatus.FAILED;
    this.record(new InvoicePaymentFailedEvent(this._id, reason));
  }

  void(): void {
    this._status = InvoiceStatus.VOID;
  }

  private record(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents.length = 0;
    return events;
  }

  get id(): string {
    return this._id;
  }

  get subscriptionId(): string {
    return this._subscriptionId;
  }

  get amount(): Money {
    return this._amount;
  }

  get status(): InvoiceStatus {
    return this._status;
  }

  get issuedAt(): Date {
    return this._issuedAt;
  }

  get paidAt(): Date | null {
    return this._paidAt;
  }
}

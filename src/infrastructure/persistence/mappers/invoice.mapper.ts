import { Invoice, InvoiceStatus } from '../../../domain/invoice/invoice.entity';
import { Money } from '../../../domain/value-objects/money.vo';
import { InvoiceEntity } from '../entities/invoice.entity';

export class InvoiceMapper {
  static toDomain(this: void, entity: InvoiceEntity): Invoice {
    return Invoice.reconstitute({
      id: entity.id,
      subscriptionId: entity.subscriptionId,
      amount: Money.fromMinorUnits(entity.amountMinorUnits, entity.currency),
      status: entity.status as InvoiceStatus,
      issuedAt: entity.issuedAt,
      paidAt: entity.paidAt,
    });
  }

  static toPersistence(invoice: Invoice): InvoiceEntity {
    const entity = new InvoiceEntity();
    entity.id = invoice.id;
    entity.subscriptionId = invoice.subscriptionId;
    entity.amountMinorUnits = invoice.amount.getAmountMinorUnits();
    entity.currency = invoice.amount.getCurrency();
    entity.status = invoice.status;
    entity.issuedAt = invoice.issuedAt;
    entity.paidAt = invoice.paidAt;
    return entity;
  }
}

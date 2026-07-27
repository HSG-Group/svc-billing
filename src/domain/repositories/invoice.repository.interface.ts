import { Invoice } from '../invoice/invoice.entity';

export interface InvoiceRepositoryInterface {
  findById(id: string): Promise<Invoice | null>;
  findBySubscriptionId(subscriptionId: string): Promise<Invoice[]>;
  save(invoice: Invoice): Promise<void>;
}

export const INVOICE_REPOSITORY = Symbol('INVOICE_REPOSITORY');

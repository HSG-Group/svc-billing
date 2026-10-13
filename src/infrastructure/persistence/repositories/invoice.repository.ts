/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import { Invoice } from 'src/domain/invoice/invoice.entity';
import { InvoiceRepositoryInterface } from 'src/domain/repositories/invoice.repository.interface';

@Injectable()
export class InvoiceRepository implements InvoiceRepositoryInterface {
  private readonly store = new Map<string, Invoice>();

  async save(invoice: Invoice): Promise<void> {
    this.store.set(invoice.id, invoice);
  }

  async findById(id: string): Promise<Invoice | null> {
    return this.store.get(id) || null;
  }

  async findBySubscriptionId(subscriptionId: string): Promise<Invoice[]> {
    return [...this.store.values()].filter(
      (i) => i.subscriptionId === subscriptionId,
    );
  }
}

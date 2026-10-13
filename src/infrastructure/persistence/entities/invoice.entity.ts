import { Entity, PrimaryColumn, Column, Index } from 'typeorm';

@Entity('invoices')
export class InvoiceEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'subscription_id' })
  subscriptionId: string;

  @Column({ name: 'amount_minor_units', type: 'int' })
  amountMinorUnits: number;

  @Column({ length: 3 })
  currency: string;

  @Column()
  status: string;

  @Column({ name: 'issued_at', type: 'timestamp' })
  issuedAt: Date;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date | null;
}

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('subscriptions')
export class SubscriptionEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ name: 'plan_id' })
  planId: string;

  @Column({ name: 'plan_name' })
  planName: string;

  @Column({ name: 'plan_amount_minor_units', type: 'int' })
  planAmountMinorUnits: number;

  @Column({ name: 'plan_currency', length: 3 })
  planCurrency: string;

  @Column({ name: 'plan_interval' })
  planInterval: string;

  @Column({ name: 'plan_trial_period_days', type: 'int', default: 0 })
  planTrialPeriodDays: number;

  @Column()
  status: string;

  @Column({ name: 'current_period_end', type: 'timestamp' })
  currentPeriodEnd: Date;

  @Column({ name: 'cancel_at_period_end', default: false })
  cancelAtPeriodEnd: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

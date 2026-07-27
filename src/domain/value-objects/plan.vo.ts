import { Money } from './money.vo';

export enum BillingInterval {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export interface PlanProps {
  id: string;
  name: string;
  price: Money;
  interval: BillingInterval;
  trialPeriodDays?: number;
}

/**
 * Plan value object.
 * Represents a subscribable pricing plan. Immutable by design.
 */
export class Plan {
  readonly id: string;
  readonly name: string;
  readonly price: Money;
  readonly interval: BillingInterval;
  readonly trialPeriodDays: number;

  private constructor(props: PlanProps) {
    if (!props.id) {
      throw new Error('Plan id is required');
    }
    if (!props.name) {
      throw new Error('Plan name is required');
    }

    this.id = props.id;
    this.name = props.name;
    this.price = props.price;
    this.interval = props.interval;
    this.trialPeriodDays = props.trialPeriodDays ?? 0;
  }

  static create(props: PlanProps): Plan {
    return new Plan(props);
  }

  hasTrial(): boolean {
    return this.trialPeriodDays > 0;
  }

  equals(other: Plan): boolean {
    return this.id === other.id;
  }
}

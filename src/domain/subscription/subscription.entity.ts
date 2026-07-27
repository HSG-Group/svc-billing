import { Plan } from '../value-objects/plan.vo';
import {
  DomainEvent,
  SubscriptionActivatedEvent,
  SubscriptionCancelledEvent,
  SubscriptionCreatedEvent,
  SubscriptionPlanChangedEvent,
} from './subscription.events';

export enum SubscriptionStatus {
  TRIALING = 'trialing',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
}

export interface SubscriptionProps {
  id: string;
  customerId: string;
  plan: Plan;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
}

/**
 * Subscription aggregate root.
 * Encapsulates all invariants for a customer's subscription lifecycle.
 * Framework-agnostic: no NestJS or ORM decorators here.
 */
export class Subscription {
  private readonly _id: string;
  private readonly _customerId: string;
  private _plan: Plan;
  private _status: SubscriptionStatus;
  private _currentPeriodEnd: Date;
  private _cancelAtPeriodEnd: boolean;
  private readonly _createdAt: Date;
  private readonly _domainEvents: DomainEvent[] = [];

  private constructor(props: SubscriptionProps) {
    this._id = props.id;
    this._customerId = props.customerId;
    this._plan = props.plan;
    this._status = props.status;
    this._currentPeriodEnd = props.currentPeriodEnd;
    this._cancelAtPeriodEnd = props.cancelAtPeriodEnd;
    this._createdAt = props.createdAt;
  }

  /** Factory used when creating a brand-new subscription. */
  static create(params: { id: string; customerId: string; plan: Plan }): Subscription {
    const now = new Date();
    const status = params.plan.hasTrial() ? SubscriptionStatus.TRIALING : SubscriptionStatus.ACTIVE;
    const currentPeriodEnd = Subscription.computePeriodEnd(now, params.plan);

    const subscription = new Subscription({
      id: params.id,
      customerId: params.customerId,
      plan: params.plan,
      status,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
      createdAt: now,
    });

    subscription.record(new SubscriptionCreatedEvent(params.id, params.customerId, params.plan.id));

    if (status === SubscriptionStatus.ACTIVE) {
      subscription.record(new SubscriptionActivatedEvent(params.id, currentPeriodEnd));
    }

    return subscription;
  }

  /** Factory used to rehydrate an aggregate from persistence. No events are raised. */
  static reconstitute(props: SubscriptionProps): Subscription {
    return new Subscription(props);
  }

  activate(): void {
    if (this._status === SubscriptionStatus.CANCELLED) {
      throw new Error('Cannot activate a cancelled subscription');
    }
    this._status = SubscriptionStatus.ACTIVE;
    this.record(new SubscriptionActivatedEvent(this._id, this._currentPeriodEnd));
  }

  markPastDue(): void {
    if (this._status === SubscriptionStatus.CANCELLED) {
      return;
    }
    this._status = SubscriptionStatus.PAST_DUE;
  }

  changePlan(newPlan: Plan): void {
    if (this._status === SubscriptionStatus.CANCELLED) {
      throw new Error('Cannot change the plan of a cancelled subscription');
    }
    const previousPlanId = this._plan.id;
    this._plan = newPlan;
    this.record(new SubscriptionPlanChangedEvent(this._id, previousPlanId, newPlan.id));
  }

  cancel(reason?: string): void {
    if (this._status === SubscriptionStatus.CANCELLED) {
      return;
    }
    this._status = SubscriptionStatus.CANCELLED;
    this._cancelAtPeriodEnd = false;
    this.record(new SubscriptionCancelledEvent(this._id, reason));
  }

  renewPeriod(): void {
    this._currentPeriodEnd = Subscription.computePeriodEnd(this._currentPeriodEnd, this._plan);
  }

  isActive(): boolean {
    return this._status === SubscriptionStatus.ACTIVE || this._status === SubscriptionStatus.TRIALING;
  }

  private static computePeriodEnd(from: Date, plan: Plan): Date {
    const periodEnd = new Date(from);
    if (plan.hasTrial()) {
      periodEnd.setDate(periodEnd.getDate() + plan.trialPeriodDays);
      return periodEnd;
    }
    if (plan.interval === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }
    return periodEnd;
  }

  private record(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /** Pulls and clears pending domain events. Called by the application layer after persisting. */
  pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents.length = 0;
    return events;
  }

  get id(): string {
    return this._id;
  }

  get customerId(): string {
    return this._customerId;
  }

  get plan(): Plan {
    return this._plan;
  }

  get status(): SubscriptionStatus {
    return this._status;
  }

  get currentPeriodEnd(): Date {
    return this._currentPeriodEnd;
  }

  get cancelAtPeriodEnd(): boolean {
    return this._cancelAtPeriodEnd;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}

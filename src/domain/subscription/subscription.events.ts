/**
 * Domain events for the Subscription aggregate.
 * These are framework-agnostic and get dispatched by the application layer
 * (e.g. via NestJS CQRS's EventBus) after a use case commits.
 */

export abstract class DomainEvent {
  readonly occurredAt: Date = new Date();
}

export class SubscriptionCreatedEvent extends DomainEvent {
  constructor(
    readonly subscriptionId: string,
    readonly customerId: string,
    readonly planId: string,
  ) {
    super();
  }
}

export class SubscriptionActivatedEvent extends DomainEvent {
  constructor(
    readonly subscriptionId: string,
    readonly currentPeriodEnd: Date,
  ) {
    super();
  }
}

export class SubscriptionCancelledEvent extends DomainEvent {
  constructor(
    readonly subscriptionId: string,
    readonly reason?: string,
  ) {
    super();
  }
}

export class SubscriptionPlanChangedEvent extends DomainEvent {
  constructor(
    readonly subscriptionId: string,
    readonly previousPlanId: string,
    readonly newPlanId: string,
  ) {
    super();
  }
}

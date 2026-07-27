import { Subscription } from '../subscription/subscription.entity';

/**
 * Port for Subscription persistence. Implemented by an infrastructure adapter.
 * Kept in the domain layer so use cases can depend on the abstraction, not the implementation.
 */
export interface SubscriptionRepositoryInterface {
  findById(id: string): Promise<Subscription | null>;
  findByCustomerId(customerId: string): Promise<Subscription[]>;
  save(subscription: Subscription): Promise<void>;
  delete(id: string): Promise<void>;
}

export const SUBSCRIPTION_REPOSITORY = Symbol('SUBSCRIPTION_REPOSITORY');

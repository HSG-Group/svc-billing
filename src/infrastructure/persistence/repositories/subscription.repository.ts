import { Injectable } from '@nestjs/common';

import { Subscription } from '../../../domain/subscription/subscription.entity';
import { SubscriptionRepositoryInterface } from '../../../domain/repositories/subscription.repository.interface';

/**
 * In-memory adapter for local development and tests.
 * Swap this out for a TypeORM/Prisma/Drizzle-backed implementation in production
 * — the rest of the app only depends on SubscriptionRepositoryInterface, so no
 * other layer needs to change.
 */
@Injectable()
export class SubscriptionRepository implements SubscriptionRepositoryInterface {
  private readonly store = new Map<string, Subscription>();

  async findById(id: string): Promise<Subscription | null> {
    return await Promise.resolve(this.store.get(id) ?? null);
  }

  async findByCustomerId(customerId: string): Promise<Subscription[]> {
    return await Promise.resolve(
      [...this.store.values()].filter((s) => s.customerId === customerId),
    );
  }

  async save(subscription: Subscription): Promise<void> {
    await Promise.resolve(this.store.set(subscription.id, subscription));
  }

  async delete(id: string): Promise<void> {
    await Promise.resolve(this.store.delete(id));
  }
}

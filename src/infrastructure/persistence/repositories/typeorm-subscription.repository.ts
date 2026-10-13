import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Subscription } from '../../../domain/subscription/subscription.entity';
import { SubscriptionRepositoryInterface } from '../../../domain/repositories/subscription.repository.interface';
import { SubscriptionEntity } from '../entities/subscription.entity';
import { SubscriptionMapper } from '../mappers/subscription.mapper';

@Injectable()
export class TypeOrmSubscriptionRepository implements SubscriptionRepositoryInterface {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly repo: Repository<SubscriptionEntity>,
  ) {}

  async findById(id: string): Promise<Subscription | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? SubscriptionMapper.toDomain(entity) : null;
  }

  async findByCustomerId(customerId: string): Promise<Subscription[]> {
    const entities = await this.repo.find({ where: { customerId } });
    return entities.map(SubscriptionMapper.toDomain);
  }

  async save(subscription: Subscription): Promise<void> {
    const entity = SubscriptionMapper.toPersistence(subscription);
    await this.repo.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}

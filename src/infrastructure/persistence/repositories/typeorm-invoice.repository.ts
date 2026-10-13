import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Invoice } from '../../../domain/invoice/invoice.entity';
import { InvoiceRepositoryInterface } from '../../../domain/repositories/invoice.repository.interface';
import { InvoiceEntity } from '../entities/invoice.entity';
import { InvoiceMapper } from '../mappers/invoice.mapper';

@Injectable()
export class TypeOrmInvoiceRepository implements InvoiceRepositoryInterface {
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly repo: Repository<InvoiceEntity>,
  ) {}

  async findById(id: string): Promise<Invoice | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? InvoiceMapper.toDomain(entity) : null;
  }

  async findBySubscriptionId(subscriptionId: string): Promise<Invoice[]> {
    const entities = await this.repo.find({ where: { subscriptionId } });
    return entities.map(InvoiceMapper.toDomain);
  }

  async save(invoice: Invoice): Promise<void> {
    await this.repo.save(InvoiceMapper.toPersistence(invoice));
  }
}

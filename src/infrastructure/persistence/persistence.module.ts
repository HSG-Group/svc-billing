import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { InvoiceEntity } from './entities/invoice.entity';
import { SubscriptionEntity } from './entities/subscription.entity';
import { InvoiceRepository } from './repositories/invoice.repository';
import { SubscriptionRepository } from './repositories/subscription.repository';
import { TypeOrmInvoiceRepository } from './repositories/typeorm-invoice.repository';
import { TypeOrmSubscriptionRepository } from './repositories/typeorm-subscription.repository';

import { INVOICE_REPOSITORY } from '../../domain/repositories/invoice.repository.interface';
import { SUBSCRIPTION_REPOSITORY } from '../../domain/repositories/subscription.repository.interface';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'billing'),
        password: config.get<string>('DB_PASSWORD', 'billing'),
        database: config.get<string>('DB_NAME', 'billing'),
        entities: [InvoiceEntity, SubscriptionEntity],
        synchronize: config.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
        logging: config.get<string>('DB_LOGGING', 'false') === 'true',
      }),
    }),
    TypeOrmModule.forFeature([InvoiceEntity, SubscriptionEntity]),
  ],
  providers: [
    SubscriptionRepository,
    InvoiceRepository,
    TypeOrmSubscriptionRepository,
    TypeOrmInvoiceRepository,
    {
      provide: SUBSCRIPTION_REPOSITORY,
      inject: [
        ConfigService,
        SubscriptionRepository,
        TypeOrmSubscriptionRepository,
      ],
      useFactory: (
        config: ConfigService,
        mem: SubscriptionRepository,
        db: TypeOrmSubscriptionRepository,
      ) => (config.get('USE_DATABASE') === 'true' ? db : mem),
    },
    {
      provide: INVOICE_REPOSITORY,
      inject: [ConfigService, InvoiceRepository, TypeOrmInvoiceRepository],
      useFactory: (
        config: ConfigService,
        mem: InvoiceRepository,
        db: TypeOrmInvoiceRepository,
      ) => (config.get('USE_DATABASE') === 'true' ? db : mem),
    },
  ],
  exports: [SUBSCRIPTION_REPOSITORY, INVOICE_REPOSITORY],
})
export class PersistenceModule {}

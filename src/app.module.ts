import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SubscriptionModule } from './modules/subscription.module';
import { StripeModule } from './modules/stripe.module';
import { InvoiceModule } from './modules/invoice.module';
import { PersistenceModule } from './infrastructure/persistence/persistence.module';
import { HealthController } from './modules/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PersistenceModule,
    StripeModule,
    SubscriptionModule,
    InvoiceModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

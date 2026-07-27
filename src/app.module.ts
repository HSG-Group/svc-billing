import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// import { SubscriptionModule } from './modules/subscription.module';
// import { StripeModule } from './modules/stripe.module';
import { HealthController } from './modules/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // SubscriptionModule,
    // StripeModule,
    // HealthController, ==> wrong way to declare controller
  ],
  controllers: [
    HealthController,
  ]
})
export class AppModule {}

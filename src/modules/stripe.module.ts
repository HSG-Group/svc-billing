import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { StripeService } from '../infrastructure/stripe/stripe.service';
import { FakePaymentGateway } from '../infrastructure/stripe/fake-payment.gateway';
import { StripeWebhookController } from '../infrastructure/stripe/stripe-webhook.controller';
import { PAYMENT_GATEWAY } from '../application/ports/payment-gateway.interface';

const isRealStripeKey = (key?: string): boolean =>
  !!key &&
  key.startsWith('sk_') &&
  !key.toLowerCase().includes('placeholder') &&
  key !== 'sk_test_dummy';

@Module({
  imports: [CqrsModule, ConfigModule],
  controllers: [StripeWebhookController],
  providers: [
    StripeService,
    FakePaymentGateway,
    {
      provide: PAYMENT_GATEWAY,
      inject: [ConfigService, StripeService, FakePaymentGateway],
      useFactory: (
        config: ConfigService,
        real: StripeService,
        fake: FakePaymentGateway,
      ) => {
        const key = config.get<string>('STRIPE_SECRET_KEY');
        const useReal = isRealStripeKey(key);
        console.log(
          useReal
            ? '[StripeModule] Using real StripeService'
            : '[StripeModule] Using FakePaymentGateway (STRIPE_SECRET_KEY is placeholder/missing)',
        );
        return useReal ? real : fake;
      },
    },
  ],
  exports: [PAYMENT_GATEWAY, StripeService],
})
export class StripeModule {}

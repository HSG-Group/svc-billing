import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { StripeService } from '../infrastructure/stripe/stripe.service';
import { StripeWebhookController } from '../infrastructure/stripe/stripe-webhook.controller';
import { PAYMENT_GATEWAY } from '../application/ports/payment-gateway.interface';

@Module({
  imports: [CqrsModule],
  controllers: [StripeWebhookController],
  providers: [
    StripeService,
    {
      provide: PAYMENT_GATEWAY,
      useExisting: StripeService,
    },
  ],
  exports: [PAYMENT_GATEWAY, StripeService],
})
export class StripeModule {}

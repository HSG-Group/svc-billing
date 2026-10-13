import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { Money } from '../../domain/value-objects/money.vo';
import {
  ChargeResult,
  PaymentCustomerRef,
  PaymentGatewayInterface,
} from '../../application/ports/payment-gateway.interface';

/**
 * Stripe adapter. Implements the PaymentGatewayInterface port so the
 * application layer never depends on the Stripe SDK directly.
 */
@Injectable()
export class StripeService implements PaymentGatewayInterface {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!apiKey || apiKey.includes('placeholder')) {
      this.logger.warn(
        'STRIPE_SECRET_KEY is missing or placeholder — StripeService will be unusable, use FakePaymentGateway instead.',
      );
      this.stripe = new Stripe('sk_test_dummy', {
        apiVersion: '2025-02-24.acacia',
      });
      return;
    }
    this.stripe = new Stripe(apiKey, { apiVersion: '2025-02-24.acacia' });
  }

  async attachPaymentMethod(
    customerId: string,
    paymentMethodId: string,
  ): Promise<PaymentCustomerRef> {
    let customer: Stripe.Customer;

    const existing = await this.stripe.customers.search({
      query: `metadata['internalCustomerId']:'${customerId}'`,
    });

    if (existing.data.length > 0) {
      customer = existing.data[0];
    } else {
      customer = await this.stripe.customers.create({
        metadata: { internalCustomerId: customerId },
      });
    }

    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });
    await this.stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    return { externalCustomerId: customer.id };
  }

  async charge(
    customerRef: PaymentCustomerRef,
    amount: Money,
  ): Promise<ChargeResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount.getAmountMinorUnits(),
        currency: amount.getCurrency().toLowerCase(),
        customer: customerRef.externalCustomerId,
        off_session: true,
        confirm: true,
      });

      return {
        externalChargeId: paymentIntent.id,
        succeeded: paymentIntent.status === 'succeeded',
      };
    } catch (error) {
      this.logger.warn(
        `Charge failed for customer ${customerRef.externalCustomerId}: ${(error as Error).message}`,
      );
      return {
        externalChargeId: '',
        succeeded: false,
        failureReason: (error as Error).message,
      };
    }
  }

  async cancelExternalSubscription(
    externalSubscriptionId: string,
  ): Promise<void> {
    await this.stripe.subscriptions.cancel(externalSubscriptionId);
  }

  /** Exposed so the webhook controller can verify signatures with the same client. */
  constructEvent(
    payload: Buffer,
    signature: string,
    webhookSecret: string,
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }
}

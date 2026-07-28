import { BadRequestException, Controller, Headers, Logger, Post, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventBus } from '@nestjs/cqrs';
import type { FastifyRequest } from 'fastify';
import Stripe from 'stripe';

import { StripeService } from './stripe.service';
import { InvoicePaidEvent, InvoicePaymentFailedEvent } from '../../domain/invoice/invoice.events';

/**
 * Receives asynchronous events from Stripe (payment succeeded/failed, etc.)
 * and translates them into domain events on the internal EventBus.
 *
 * Requires the app to be bootstrapped with `rawBody: true` (see main.ts) so
 * `req.rawBody` is available for signature verification.
 */
@Controller('webhooks/stripe')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
    private readonly eventBus: EventBus,
  ) {}

  @Post()
  async handleWebhook(@Req() req: RawBodyRequest<FastifyRequest>, @Headers('stripe-signature') signature: string) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!signature || !webhookSecret || !req.rawBody) {
      throw new BadRequestException('Missing Stripe signature, webhook secret, or raw body');
    }

    let event: Stripe.Event;
    try {
      event = this.stripeService.constructEvent(req.rawBody, signature, webhookSecret);
    } catch (error) {
      this.logger.warn(`Invalid Stripe webhook signature: ${(error as Error).message}`);
      throw new BadRequestException('Invalid signature');
    }

    switch (event.type) {
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        this.eventBus.publish(new InvoicePaidEvent(invoice.id, new Date()));
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        this.eventBus.publish(new InvoicePaymentFailedEvent(invoice.id, 'stripe_payment_failed'));
        break;
      }
      default:
        this.logger.debug(`Unhandled Stripe event type: ${event.type}`);
    }

    return { received: true };
  }
}

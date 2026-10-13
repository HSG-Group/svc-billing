import { Injectable, Logger } from '@nestjs/common';
import {
  ChargeResult,
  PaymentCustomerRef,
  PaymentGatewayInterface,
} from '../../application/ports/payment-gateway.interface';
import { Money } from '../../domain/value-objects/money.vo';

@Injectable()
export class FakePaymentGateway implements PaymentGatewayInterface {
  private readonly logger = new Logger(FakePaymentGateway.name);

  async attachPaymentMethod(
    customerId: string,
    paymentMethodId: string,
  ): Promise<PaymentCustomerRef> {
    this.logger.warn(
      `[FAKE] attachPaymentMethod(${customerId}, ${paymentMethodId})`,
    );
    return { externalCustomerId: `cus_fake_${customerId}` };
  }

  async charge(
    customerRef: PaymentCustomerRef,
    amount: Money,
  ): Promise<ChargeResult> {
    this.logger.warn(
      `[FAKE] charge(${customerRef.externalCustomerId}, ${amount.toString()})`,
    );
    return {
      externalChargeId: `ch_fake_${Date.now()}`,
      succeeded: true,
    };
  }

  async cancelExternalSubscription(
    externalSubscriptionId: string,
  ): Promise<void> {
    this.logger.warn(
      `[FAKE] cancelExternalSubscription(${externalSubscriptionId})`,
    );
  }
}

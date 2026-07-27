import { Money } from '../../domain/value-objects/money.vo';

export interface PaymentCustomerRef {
  externalCustomerId: string;
}

export interface ChargeResult {
  externalChargeId: string;
  succeeded: boolean;
  failureReason?: string;
}

/**
 * Port for any external payment provider (Stripe, Adyen, etc).
 * The application layer only knows about this abstraction.
 */
export interface PaymentGatewayInterface {
  attachPaymentMethod(customerId: string, paymentMethodId: string): Promise<PaymentCustomerRef>;
  charge(customerRef: PaymentCustomerRef, amount: Money): Promise<ChargeResult>;
  cancelExternalSubscription(externalSubscriptionId: string): Promise<void>;
}

export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

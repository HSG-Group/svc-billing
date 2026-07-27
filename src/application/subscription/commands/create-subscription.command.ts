export class CreateSubscriptionCommand {
  constructor(
    readonly customerId: string,
    readonly planId: string,
    readonly paymentMethodId: string,
    readonly interval: 'monthly' | 'yearly',
  ) {}
}

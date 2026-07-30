export class CancelSubscriptionCommand {
  constructor(
    readonly subscriptionId: string,
    readonly reason?: string,
  ) {}
}

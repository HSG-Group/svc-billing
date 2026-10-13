export class ChangePlanCommand {
  constructor(
    readonly subscriptionId: string,
    readonly newPlanId: string,
    readonly interval: 'monthly' | 'yearly' = 'monthly',
  ) {}
}

import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsNotEmpty()
  planId: string;

  @IsString()
  @IsNotEmpty()
  paymentMethodId: string;

  @IsIn(['monthly', 'yearly'])
  interval: 'monthly' | 'yearly';
}

import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChangePlanDto {
  @IsNotEmpty()
  @IsString()
  newPlanId: string;
  @IsOptional()
  @IsEnum(['monthly', 'yearly'])
  interval?: 'monthly' | 'yearly';
}

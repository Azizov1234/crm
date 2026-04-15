import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateSubscriptionStatusDto {
  @ApiProperty({ enum: SubscriptionStatus })
  @IsEnum(SubscriptionStatus)
  subscriptionStatus: SubscriptionStatus;
}

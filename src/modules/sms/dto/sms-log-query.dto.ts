import { ApiPropertyOptional } from '@nestjs/swagger';
import { SmsStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

export class SmsLogQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({ enum: SmsStatus })
  @IsOptional()
  @IsEnum(SmsStatus)
  smsStatus?: SmsStatus;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PayPaymentDto {
  @ApiProperty({ example: 200000 })
  @Type(() => Number)
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'cash' })
  @IsString()
  method: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referenceNo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

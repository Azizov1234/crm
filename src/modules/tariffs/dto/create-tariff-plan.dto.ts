import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTariffPlanDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ example: 1200000 })
  @Type(() => Number)
  @IsNumber()
  price: number;

  @ApiProperty({ example: 30 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationDays: number;

  @ApiProperty({ example: 500 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  studentLimit: number;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  branchLimit: number;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  features?: Record<string, unknown>;
}

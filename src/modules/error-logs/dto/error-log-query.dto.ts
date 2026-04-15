import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

export class ErrorLogQueryDto extends BaseQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(100)
  statusCode?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  method?: string;
}

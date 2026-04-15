import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ChangeStatusDto {
  @ApiProperty({ enum: Status, example: Status.ACTIVE })
  @IsEnum(Status)
  status: Status;
}

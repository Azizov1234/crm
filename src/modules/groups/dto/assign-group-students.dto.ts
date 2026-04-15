import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class AssignGroupStudentsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  studentIds: string[];
}

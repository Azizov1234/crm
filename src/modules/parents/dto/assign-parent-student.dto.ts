import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class AssignParentStudentDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  studentIds: string[];
}

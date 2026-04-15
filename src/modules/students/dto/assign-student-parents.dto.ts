import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class AssignStudentParentsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  parentIds: string[];
}

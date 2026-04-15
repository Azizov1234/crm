import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class AssignStudentGroupsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  groupIds: string[];
}

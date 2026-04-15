import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateStaffAttendanceDto } from './create-staff-attendance.dto';

export class BulkStaffAttendanceDto {
  @ApiProperty({ type: [CreateStaffAttendanceDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateStaffAttendanceDto)
  records: CreateStaffAttendanceDto[];
}

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsBoolean, IsNumber, IsOptional } from "class-validator"

export class CreateAttendanceDto {

    @ApiProperty()
    @IsNumber()
    student_id: number

    @ApiProperty()
    @IsNumber()
    lesson_id: number

    @ApiProperty()
    @IsBoolean()
    isPresent: boolean
}

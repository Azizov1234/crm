
import { ApiProperty } from "@nestjs/swagger";
import { WeekDay } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateGroupDto {
    @ApiProperty()
    @IsString()
    @MinLength(3)
    name: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    @MaxLength(200)
    description?: string;

    @ApiProperty()
    @IsNumber()
    @Type(() => Number)    // string -> number transform
    course_id: number;

    @ApiProperty()
    @IsNumber()
    @Type(() => Number)
    teacher_id: number;

    @ApiProperty()
    @IsNumber()
    @Type(() => Number)
    room_id: number;

    @ApiProperty()
    @IsString()
    start_date: string;

    @ApiProperty({ enum: WeekDay,  example:[
                "MONDAY",
                "TUESDAY",
                "WEDNESDAY",
                "THURSDAY",
                "FRIDAY",
                "SATURDAY",
                "SUNDAY"
            ] })
    @IsArray()
      // JSON string → array
    week_day: WeekDay[];

    @ApiProperty()
    @IsString()
    start_time: string;

    @ApiProperty()
    @IsNumber()
    @Type(() => Number)
    max_student: number;
}

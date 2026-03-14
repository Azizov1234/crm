import { ApiProperty, ApiPropertyOptional, ApiQuery } from "@nestjs/swagger"
import { CourseLevel } from "@prisma/client"
import { Decimal } from "@prisma/client/runtime/client"
import { IsDecimal, IsEnum, IsNumber, IsOptional, IsString, MaxLength, MinLength } from "class-validator"

export class CreateCourseDto{
    @ApiProperty()
    @IsString()
    @MinLength(3)
    name:string

    @ApiProperty()
    @IsOptional()
    @IsString()
    @MaxLength(200)
    description?:string

    @ApiProperty()
    @IsNumber()
    price:number
              
    @ApiProperty()
    @IsNumber()
    duration_month:number

    @ApiProperty()
    @IsNumber()
    duration_hours:number

    @ApiProperty()
    @IsEnum(CourseLevel)
    level:CourseLevel
}
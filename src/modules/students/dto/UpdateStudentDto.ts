import { ApiProperty } from "@nestjs/swagger"
import { IsDateString, IsEmail, IsMobilePhone, IsOptional, IsString, IsStrongPassword } from "class-validator"


export class UpdateStudentDto {

    @IsOptional()
    @ApiProperty()
    @IsString()
    first_name?: string

    @IsOptional()
    @ApiProperty()
    @IsString()
    last_name?: string

    @IsOptional()
    @ApiProperty()
    @IsStrongPassword()
    password?: string

    @IsOptional()
    @ApiProperty()
    @IsMobilePhone("uz-UZ")
    phone?: string

    @IsOptional()
    @ApiProperty()
    @IsString()
    @IsEmail()
    email?: string

    @IsOptional()
    @ApiProperty()
    @IsString()
    address?: string

    @IsOptional()
    @IsDateString()
    birth_date?: Date

    @IsOptional()
    @ApiProperty({ type: 'string', format: 'binary' })
    photo?: any;


}
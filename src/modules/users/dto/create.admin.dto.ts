import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsEnum, IsMobilePhone, IsString, IsStrongPassword } from "class-validator"

export class CreateUserDto {

    @ApiProperty()
    @IsString()
    fist_name: string

    @ApiProperty()
    @IsString()
    last_name: string

    @ApiProperty()
    @IsStrongPassword()
    password: string

    @ApiProperty()
    @IsMobilePhone("uz-UZ")
    phone: string

    @ApiProperty()
    @IsString()
    @IsEmail()
    email: string

    @ApiProperty()
    @IsString()
    address: string
}
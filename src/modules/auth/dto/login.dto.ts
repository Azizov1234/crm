import { ApiProperty } from "@nestjs/swagger";
import { IsMobilePhone, IsStrongPassword } from "class-validator";

export class LoginDto {
    @ApiProperty()
    @IsMobilePhone("uz-UZ")
    phone: string
    
    @ApiProperty()
    @IsStrongPassword()
    password: string
}
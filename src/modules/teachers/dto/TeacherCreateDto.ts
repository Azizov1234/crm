import { ApiProperty } from "@nestjs/swagger"
import {  IsEmail, IsMobilePhone, IsString, IsStrongPassword } from "class-validator"

export class TeacherCreateDto {
   @ApiProperty()
      @IsString()
      first_name: string
  
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
   

      @ApiProperty({ type: 'string', format: 'binary' })
      photo: any;
        
}
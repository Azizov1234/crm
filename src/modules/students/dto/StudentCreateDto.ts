import { ApiProperty } from "@nestjs/swagger"
import { IsDateString, IsEmail, IsMobilePhone, IsString, IsStrongPassword } from "class-validator"

export class StudentCreateDto {
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
      @IsDateString()
      birth_date:Date

      @ApiProperty({ type: 'string', format: 'binary' })
      photo: any;
        
}
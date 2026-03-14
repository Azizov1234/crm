import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsString } from "class-validator"

export class CreateHomeworkDto {
    @ApiProperty()
    @IsNumber()
    lesson_id:number
   
    @ApiProperty()
    @IsNumber()
    group_id:number

    @ApiProperty()
    @IsString()
    title:string
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateGroupRoomDto {
  @ApiProperty()
  @IsString()
  roomId: string;
}

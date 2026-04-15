import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { BaseQueryDto } from '../../common/dto/base-query.dto';
import { ChangeStatusDto } from '../../common/dto/change-status.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import {
  paginatedResponse,
  successResponse,
} from '../../common/utils/api-response';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomsService } from './rooms.service';

@ApiTags('Rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @ApiOperation({ summary: 'Xona yaratish' })
  async create(
    @Body() dto: CreateRoomDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.roomsService.createRoom(dto, user, request);
    return successResponse('Xona yaratildi', data);
  }

  @Get()
  @ApiOperation({ summary: 'Xonalar royxati' })
  async findAll(
    @Query() query: BaseQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.roomsService.findRooms(query, user);
    return paginatedResponse(result.data, result.meta);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta xona' })
  async findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    const data = await this.roomsService.findRoom(id, user);
    return successResponse('Xona topildi', data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Xonani yangilash' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRoomDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.roomsService.updateRoom(id, dto, user, request);
    return successResponse('Xona yangilandi', data);
  }

  @Patch(':id/delete')
  @ApiOperation({ summary: 'Xonani soft delete qilish' })
  async softDelete(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.roomsService.deleteRoom(id, user, request);
    return successResponse('Xona ochirildi', data);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Xona statusini ozgartirish' })
  async changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.roomsService.changeRoomStatus(
      id,
      dto.status,
      user,
      request,
    );
    return successResponse('Xona statusi ozgardi', data);
  }
}

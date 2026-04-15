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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import {
  paginatedResponse,
  successResponse,
} from '../../common/utils/api-response';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { TimetableQueryDto } from './dto/timetable-query.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { TimetableService } from './timetable.service';

@ApiTags('Timetable')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Post()
  @ApiOperation({ summary: 'Jadval yaratish' })
  async create(
    @Body() dto: CreateTimetableDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.timetableService.createTimetable(
      dto,
      user,
      request,
    );
    return successResponse('Jadval yaratildi', data);
  }

  @Get()
  @ApiOperation({ summary: 'Jadvallar royxati' })
  async findAll(
    @Query() query: TimetableQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.timetableService.findTimetables(query, user);
    return paginatedResponse(result.data, result.meta);
  }

  @Get('by-group/:groupId')
  @ApiOperation({ summary: 'Guruh boyicha jadval' })
  async byGroup(
    @Param('groupId') groupId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.timetableService.findByGroup(groupId, user);
    return successResponse('Guruh jadvali', data);
  }

  @Get('by-room/:roomId')
  @ApiOperation({ summary: 'Xona boyicha jadval' })
  async byRoom(
    @Param('roomId') roomId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.timetableService.findByRoom(roomId, user);
    return successResponse('Xona jadvali', data);
  }

  @Get('daily')
  @ApiOperation({ summary: 'Kundalik jadval' })
  async daily(
    @Query() query: TimetableQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.timetableService.daily(query, user);
    return successResponse('Kundalik jadval', data);
  }

  @Get('daily/list')
  @ApiOperation({ summary: 'Kundalik jadval (legacy alias)' })
  async dailyAlias(
    @Query() query: TimetableQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.timetableService.daily(query, user);
    return successResponse('Kundalik jadval', data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta jadval' })
  async findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    const data = await this.timetableService.findTimetable(id, user);
    return successResponse('Jadval topildi', data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Jadvalni yangilash' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTimetableDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.timetableService.updateTimetable(
      id,
      dto,
      user,
      request,
    );
    return successResponse('Jadval yangilandi', data);
  }

  @Patch(':id/delete')
  @ApiOperation({ summary: 'Jadvalni soft delete qilish' })
  async softDelete(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.timetableService.deleteTimetable(id, user, request);
    return successResponse('Jadval ochirildi', data);
  }
}

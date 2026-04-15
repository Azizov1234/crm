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
import { AssignGroupStudentsDto } from './dto/assign-group-students.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupRoomDto } from './dto/update-group-room.dto';
import { UpdateGroupTeacherDto } from './dto/update-group-teacher.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupsService } from './groups.service';

@ApiTags('Groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Guruh yaratish' })
  async create(
    @Body() dto: CreateGroupDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.groupsService.createGroup(dto, user, request);
    return successResponse('Guruh yaratildi', data);
  }

  @Get()
  @ApiOperation({ summary: 'Guruhlar royxati' })
  async findAll(
    @Query() query: BaseQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.groupsService.findGroups(query, user);
    return paginatedResponse(result.data, result.meta);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta guruh' })
  async findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    const data = await this.groupsService.findGroup(id, user);
    return successResponse('Guruh topildi', data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Guruhni yangilash' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateGroupDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.groupsService.updateGroup(id, dto, user, request);
    return successResponse('Guruh yangilandi', data);
  }

  @Patch(':id/delete')
  @ApiOperation({ summary: 'Guruhni soft delete qilish' })
  async softDelete(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.groupsService.deleteGroup(id, user, request);
    return successResponse('Guruh ochirildi', data);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Guruh statusini ozgartirish' })
  async changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.groupsService.changeGroupStatus(
      id,
      dto.status,
      user,
      request,
    );
    return successResponse('Guruh statusi ozgardi', data);
  }

  @Post(':id/students')
  @ApiOperation({ summary: 'Guruhga student biriktirish' })
  async assignStudents(
    @Param('id') id: string,
    @Body() dto: AssignGroupStudentsDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.groupsService.addStudents(id, dto, user, request);
    return successResponse('Studentlar guruhga biriktirildi', data);
  }

  @Patch(':id/teacher')
  @ApiOperation({ summary: 'Guruh oqituvchisini ozgartirish' })
  async updateTeacher(
    @Param('id') id: string,
    @Body() dto: UpdateGroupTeacherDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.groupsService.updateTeacher(
      id,
      dto.teacherId,
      user,
      request,
    );
    return successResponse('Guruh oqituvchisi yangilandi', data);
  }

  @Patch(':id/room')
  @ApiOperation({ summary: 'Guruh xonasini ozgartirish' })
  async updateRoom(
    @Param('id') id: string,
    @Body() dto: UpdateGroupRoomDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.groupsService.updateRoom(
      id,
      dto.roomId,
      user,
      request,
    );
    return successResponse('Guruh xonasi yangilandi', data);
  }

  @Get(':id/timetable')
  @ApiOperation({ summary: 'Guruh jadvali' })
  async getTimetable(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.groupsService.getTimetable(id, user);
    return successResponse('Guruh jadvali', data);
  }

  @Get(':id/ratings')
  @ApiOperation({ summary: 'Guruh reytinglari' })
  async getRatings(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    const data = await this.groupsService.getRatings(id, user);
    return successResponse('Guruh reytinglari', data);
  }
}

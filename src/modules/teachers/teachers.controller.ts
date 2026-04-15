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
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeachersService } from './teachers.service';

@ApiTags('Teachers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @ApiOperation({ summary: 'Oqituvchi yaratish' })
  async create(
    @Body() dto: CreateTeacherDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.teachersService.createTeacher(dto, user, request);
    return successResponse('Oqituvchi yaratildi', data);
  }

  @Get()
  @ApiOperation({ summary: 'Oqituvchilar royxati' })
  async findAll(
    @Query() query: BaseQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.teachersService.findTeachers(query, user);
    return paginatedResponse(result.data, result.meta);
  }

  @Get('select-options')
  @ApiOperation({ summary: 'Select optionlar' })
  async selectOptions(
    @CurrentUser() user: RequestUser,
    @Query('branchId') branchId?: string,
  ) {
    const data = await this.teachersService.selectOptions(user, branchId);
    return successResponse('Select optionlar', data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta oqituvchi' })
  async findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    const data = await this.teachersService.findTeacher(id, user);
    return successResponse('Oqituvchi topildi', data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Oqituvchini yangilash' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTeacherDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.teachersService.updateTeacher(
      id,
      dto,
      user,
      request,
    );
    return successResponse('Oqituvchi yangilandi', data);
  }

  @Patch(':id/delete')
  @ApiOperation({ summary: 'Oqituvchini ochirish (soft delete)' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.teachersService.softDeleteTeacher(
      id,
      user,
      request,
    );
    return successResponse('Oqituvchi ochirildi', data);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Oqituvchi statusini ozgartirish' })
  async changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.teachersService.changeTeacherStatus(
      id,
      dto.status,
      user,
      request,
    );
    return successResponse('Status yangilandi', data);
  }
}

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
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@ApiTags('Courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Kurs yaratish' })
  async create(
    @Body() dto: CreateCourseDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.coursesService.createCourse(dto, user, request);
    return successResponse('Kurs yaratildi', data);
  }

  @Get()
  @ApiOperation({ summary: 'Kurslar royxati' })
  async findAll(
    @Query() query: BaseQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.coursesService.findCourses(query, user);
    return paginatedResponse(result.data, result.meta);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta kurs' })
  async findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    const data = await this.coursesService.findCourse(id, user);
    return successResponse('Kurs topildi', data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Kursni yangilash' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.coursesService.updateCourse(id, dto, user, request);
    return successResponse('Kurs yangilandi', data);
  }

  @Patch(':id/delete')
  @ApiOperation({ summary: 'Kursni soft delete qilish' })
  async softDelete(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.coursesService.deleteCourse(id, user, request);
    return successResponse('Kurs ochirildi', data);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Kurs statusini ozgartirish' })
  async changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.coursesService.changeCourseStatus(
      id,
      dto.status,
      user,
      request,
    );
    return successResponse('Kurs statusi ozgardi', data);
  }
}

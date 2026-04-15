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
import { AttendanceService } from './attendance.service';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @ApiOperation({ summary: 'Davomat belgilash' })
  async create(
    @Body() dto: CreateAttendanceDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.attendanceService.create(dto, user, request);
    return successResponse('Davomat saqlandi', data);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Davomatni ommaviy saqlash' })
  async bulkCreate(
    @Body() dto: BulkAttendanceDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.attendanceService.bulkCreate(dto, user, request);
    return successResponse('Bulk davomat saqlandi', data);
  }

  @Get()
  @ApiOperation({ summary: 'Davomatlar royxati' })
  async findAll(
    @Query() query: AttendanceQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.attendanceService.findAll(query, user);
    return paginatedResponse(result.data, result.meta);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Davomat statistikasi' })
  async stats(
    @Query() query: AttendanceQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.attendanceService.stats(query, user);
    return successResponse('Davomat statistikasi', data);
  }

  @Get('by-student/:studentId')
  @ApiOperation({ summary: 'Student boyicha davomat' })
  async byStudent(
    @Param('studentId') studentId: string,
    @Query() query: AttendanceQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.attendanceService.byStudent(
      studentId,
      query,
      user,
    );
    return paginatedResponse(result.data, result.meta);
  }

  @Get('by-group/:groupId')
  @ApiOperation({ summary: 'Guruh boyicha davomat' })
  async byGroup(
    @Param('groupId') groupId: string,
    @Query() query: AttendanceQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.attendanceService.byGroup(groupId, query, user);
    return paginatedResponse(result.data, result.meta);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Davomatni yangilash' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAttendanceDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.attendanceService.update(id, dto, user, request);
    return successResponse('Davomat yangilandi', data);
  }

  @Patch(':id/delete')
  @ApiOperation({ summary: 'Davomatni soft delete qilish' })
  async softDelete(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.attendanceService.softDelete(id, user, request);
    return successResponse('Davomat ochirildi', data);
  }
}

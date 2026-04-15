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
import { AssignStudentGroupsDto } from './dto/assign-student-groups.dto';
import { AssignStudentParentsDto } from './dto/assign-student-parents.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsService } from './students.service';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @ApiOperation({ summary: 'Oquvchi yaratish' })
  async create(
    @Body() dto: CreateStudentDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.studentsService.createStudent(dto, user, request);
    return successResponse('Oquvchi yaratildi', data);
  }

  @Get()
  @ApiOperation({ summary: 'Oquvchilar royxati' })
  async findAll(
    @Query() query: BaseQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.studentsService.findStudents(query, user);
    return paginatedResponse(result.data, result.meta);
  }

  @Get('select-options')
  @ApiOperation({ summary: 'Select optionlar' })
  async selectOptions(
    @CurrentUser() user: RequestUser,
    @Query('branchId') branchId?: string,
  ) {
    const data = await this.studentsService.selectOptions(user, branchId);
    return successResponse('Select optionlar', data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta oquvchi' })
  async findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    const data = await this.studentsService.findStudent(id, user);
    return successResponse('Oquvchi topildi', data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Oquvchini yangilash' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.studentsService.updateStudent(
      id,
      dto,
      user,
      request,
    );
    return successResponse('Oquvchi yangilandi', data);
  }

  @Patch(':id/delete')
  @ApiOperation({ summary: 'Oquvchini soft delete qilish' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.studentsService.softDeleteStudent(
      id,
      user,
      request,
    );
    return successResponse('Oquvchi ochirildi', data);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Oquvchi statusini ozgartirish' })
  async changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.studentsService.changeStudentStatus(
      id,
      dto.status,
      user,
      request,
    );
    return successResponse('Oquvchi statusi yangilandi', data);
  }

  @Post(':id/assign-parent')
  @ApiOperation({ summary: 'Oquvchiga ota-ona biriktirish' })
  async assignParent(
    @Param('id') id: string,
    @Body() dto: AssignStudentParentsDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.studentsService.assignParents(
      id,
      dto,
      user,
      request,
    );
    return successResponse('Ota-onalar biriktirildi', data);
  }

  @Post(':id/assign-groups')
  @ApiOperation({ summary: 'Oquvchini guruhlarga biriktirish' })
  async assignGroups(
    @Param('id') id: string,
    @Body() dto: AssignStudentGroupsDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.studentsService.assignGroups(
      id,
      dto,
      user,
      request,
    );
    return successResponse('Guruhlar biriktirildi', data);
  }

  @Get(':id/payments')
  @ApiOperation({ summary: 'Oquvchi tolovlari' })
  async payments(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    const data = await this.studentsService.getStudentPayments(id, user);
    return successResponse('Tolovlar', data);
  }

  @Get(':id/attendance')
  @ApiOperation({ summary: 'Oquvchi davomatlari' })
  async attendance(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    const data = await this.studentsService.getStudentAttendance(id, user);
    return successResponse('Davomatlar', data);
  }

  @Get(':id/ratings')
  @ApiOperation({ summary: 'Oquvchi reytinglari' })
  async ratings(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    const data = await this.studentsService.getStudentRatings(id, user);
    return successResponse('Reytinglar', data);
  }
}

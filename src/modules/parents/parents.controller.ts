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
import { AssignParentStudentDto } from './dto/assign-parent-student.dto';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { ParentsService } from './parents.service';

@ApiTags('Parents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('parents')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Post()
  @ApiOperation({ summary: 'Ota-ona yaratish' })
  async create(
    @Body() dto: CreateParentDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.parentsService.createParent(dto, user, request);
    return successResponse('Ota-ona yaratildi', data);
  }

  @Get()
  @ApiOperation({ summary: 'Ota-onalar royxati' })
  async findAll(
    @Query() query: BaseQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.parentsService.findParents(query, user);
    return paginatedResponse(result.data, result.meta);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta ota-ona' })
  async findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    const data = await this.parentsService.findParent(id, user);
    return successResponse('Ota-ona topildi', data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Ota-onani yangilash' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateParentDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.parentsService.updateParent(id, dto, user, request);
    return successResponse('Ota-ona yangilandi', data);
  }

  @Patch(':id/delete')
  @ApiOperation({ summary: 'Ota-onani soft delete qilish' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.parentsService.softDeleteParent(id, user, request);
    return successResponse('Ota-ona ochirildi', data);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Ota-ona statusi' })
  async changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.parentsService.changeParentStatus(
      id,
      dto.status,
      user,
      request,
    );
    return successResponse('Status yangilandi', data);
  }

  @Post(':id/assign-student')
  @ApiOperation({ summary: 'Ota-onaga student biriktirish' })
  async assignStudent(
    @Param('id') id: string,
    @Body() dto: AssignParentStudentDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.parentsService.assignStudent(
      id,
      dto,
      user,
      request,
    );
    return successResponse('Student biriktirildi', data);
  }
}

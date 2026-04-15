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
import { AdminsService } from './admins.service';
import { AttachExistingUserDto } from './dto/attach-existing-user.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminRoleDto } from './dto/update-admin-role.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@ApiTags('Admins')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  @ApiOperation({ summary: 'Admin yaratish' })
  async create(
    @Body() dto: CreateAdminDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.adminsService.createAdmin(dto, user, request);
    return successResponse('Admin yaratildi', data);
  }

  @Get()
  @ApiOperation({ summary: 'Adminlar royxati' })
  async findAll(
    @Query() query: BaseQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.adminsService.findAdmins(query, user);
    return paginatedResponse(result.data, result.meta);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta admin' })
  async findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    const data = await this.adminsService.findAdmin(id, user);
    return successResponse('Admin topildi', data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Adminni yangilash' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.adminsService.updateAdmin(id, dto, user, request);
    return successResponse('Admin yangilandi', data);
  }

  @Patch(':id/delete')
  @ApiOperation({ summary: 'Adminni soft delete qilish' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.adminsService.deleteAdmin(id, user, request);
    return successResponse('Admin ochirildi', data);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Admin rolini yangilash' })
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateAdminRoleDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.adminsService.updateRole(id, dto, user, request);
    return successResponse('Role yangilandi', data);
  }

  @Post('attach-existing-user')
  @ApiOperation({ summary: 'Mavjud userni adminga biriktirish' })
  async attachExisting(
    @Body() dto: AttachExistingUserDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.adminsService.attachExistingUser(
      dto,
      user,
      request,
    );
    return successResponse('User adminga biriktirildi', data);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Admin statusini ozgartirish' })
  async changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.adminsService.changeStatus(
      id,
      dto.status,
      user,
      request,
    );
    return successResponse('Status yangilandi', data);
  }
}

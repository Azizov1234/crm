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
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'User yaratish' })
  async create(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.usersService.createUser(dto, user, request);
    return successResponse('User yaratildi', data);
  }

  @Get()
  @ApiOperation({ summary: 'Userlar royxati' })
  async findAll(
    @Query() query: BaseQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.usersService.findUsers(query, user);
    return paginatedResponse(result.data, result.meta);
  }

  @Get('select-options')
  @ApiOperation({ summary: 'Select optionlar' })
  async selectOptions(
    @CurrentUser() user: RequestUser,
    @Query('branchId') branchId?: string,
  ) {
    const data = await this.usersService.selectOptions(user, branchId);
    return successResponse('Select optionlar', data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta user' })
  async findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    const data = await this.usersService.findUser(id, user);
    return successResponse('User topildi', data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'User yangilash' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.usersService.updateUser(id, dto, user, request);
    return successResponse('User yangilandi', data);
  }

  @Patch(':id/delete')
  @ApiOperation({ summary: 'User soft delete' })
  async softDelete(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.usersService.softDeleteUser(id, user, request);
    return successResponse('User ochirildi', data);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'User status ozgartirish' })
  async changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.usersService.changeUserStatus(
      id,
      dto.status,
      user,
      request,
    );
    return successResponse('Status ozgartirildi', data);
  }
}

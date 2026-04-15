import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/role';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import {
  paginatedResponse,
  successResponse,
} from '../../common/utils/api-response';
import { ActionLogsService } from './action-logs.service';
import { ActionLogQueryDto } from './dto/action-log-query.dto';

@ApiTags('Action Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
@Controller('action-logs')
export class ActionLogsController {
  constructor(private readonly actionLogsService: ActionLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Action loglar royxati' })
  async findAll(
    @Query() query: ActionLogQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.actionLogsService.findAll(query, user);
    return paginatedResponse(result.data, result.meta);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Action log detail' })
  async findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    const data = await this.actionLogsService.findOne(id, user);
    return successResponse('Action log topildi', data);
  }
}

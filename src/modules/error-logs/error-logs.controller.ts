import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/role';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import {
  paginatedResponse,
  successResponse,
} from '../../common/utils/api-response';
import { ErrorLogQueryDto } from './dto/error-log-query.dto';
import { ErrorLogsService } from './error-logs.service';

@ApiTags('Error Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
@Controller('error-logs')
export class ErrorLogsController {
  constructor(private readonly errorLogsService: ErrorLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Error loglar royxati' })
  async findAll(
    @Query() query: ErrorLogQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.errorLogsService.findAll(query, user);
    return paginatedResponse(result.data, result.meta);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Error log detail' })
  async findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    const data = await this.errorLogsService.findOne(id, user);
    return successResponse('Error log topildi', data);
  }
}

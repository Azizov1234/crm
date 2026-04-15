import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { successResponse } from '../../common/utils/api-response';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Dashboard umumiy statistika' })
  async overview(
    @CurrentUser() user: RequestUser,
    @Query() query: DashboardQueryDto,
  ) {
    const data = await this.dashboardService.overview(user, query);
    return successResponse('Overview', data);
  }

  @Get('gender-stats')
  @ApiOperation({ summary: 'Gender statistikasi' })
  async genderStats(
    @CurrentUser() user: RequestUser,
    @Query() query: DashboardQueryDto,
  ) {
    const data = await this.dashboardService.genderStats(user, query);
    return successResponse('Gender stats', data);
  }

  @Get('monthly-income')
  @ApiOperation({ summary: 'Oylik tushum' })
  async monthlyIncome(
    @CurrentUser() user: RequestUser,
    @Query() query: DashboardQueryDto,
  ) {
    const data = await this.dashboardService.monthlyIncome(user, query);
    return successResponse('Monthly income', data);
  }

  @Get('attendance-stats')
  @ApiOperation({ summary: 'Davomat statistikasi' })
  async attendanceStats(
    @CurrentUser() user: RequestUser,
    @Query() query: DashboardQueryDto,
  ) {
    const data = await this.dashboardService.attendanceStats(user, query);
    return successResponse('Attendance stats', data);
  }

  @Get('top-students')
  @ApiOperation({ summary: 'Top oquvchilar' })
  async topStudents(
    @CurrentUser() user: RequestUser,
    @Query() query: DashboardQueryDto,
  ) {
    const data = await this.dashboardService.topStudents(user, query);
    return successResponse('Top students', data);
  }
}

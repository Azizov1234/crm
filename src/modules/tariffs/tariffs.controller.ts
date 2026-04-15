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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import {
  paginatedResponse,
  successResponse,
} from '../../common/utils/api-response';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreateTariffPlanDto } from './dto/create-tariff-plan.dto';
import { UpdateSubscriptionStatusDto } from './dto/update-subscription-status.dto';
import { UpdateTariffPlanDto } from './dto/update-tariff-plan.dto';
import { TariffsService } from './tariffs.service';

@ApiTags('Tariffs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tariffs')
export class TariffsController {
  constructor(private readonly tariffsService: TariffsService) {}

  @Post('plans')
  @ApiOperation({ summary: 'Tariff plan yaratish' })
  async createPlan(
    @Body() dto: CreateTariffPlanDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.tariffsService.createPlan(dto, user, request);
    return successResponse('Tariff plan yaratildi', data);
  }

  @Get('plans')
  @ApiOperation({ summary: 'Tariff planlar royxati' })
  async findPlans(
    @Query() query: BaseQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.tariffsService.findPlans(query, user);
    return paginatedResponse(result.data, result.meta);
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Bitta tariff plan' })
  async findPlan(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    const data = await this.tariffsService.findPlan(id, user);
    return successResponse('Tariff plan topildi', data);
  }

  @Patch('plans/:id')
  @ApiOperation({ summary: 'Tariff plan yangilash' })
  async updatePlan(
    @Param('id') id: string,
    @Body() dto: UpdateTariffPlanDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.tariffsService.updatePlan(id, dto, user, request);
    return successResponse('Tariff plan yangilandi', data);
  }

  @Patch('plans/:id/delete')
  @ApiOperation({ summary: 'Tariff plan soft delete' })
  async deletePlan(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.tariffsService.deletePlan(id, user, request);
    return successResponse('Tariff plan ochirildi', data);
  }

  @Post('subscriptions')
  @ApiOperation({ summary: 'Subscription yaratish' })
  async createSubscription(
    @Body() dto: CreateSubscriptionDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.tariffsService.createSubscription(
      dto,
      user,
      request,
    );
    return successResponse('Subscription yaratildi', data);
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'Subscriptionlar royxati' })
  async findSubscriptions(
    @Query() query: BaseQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.tariffsService.findSubscriptions(query, user);
    return paginatedResponse(result.data, result.meta);
  }

  @Get('subscriptions/current')
  @ApiOperation({ summary: 'Joriy subscription' })
  async current(@CurrentUser() user: RequestUser) {
    const data = await this.tariffsService.currentSubscription(user);
    return successResponse('Joriy subscription', data);
  }

  @Patch('subscriptions/:id/status')
  @ApiOperation({ summary: 'Subscription statusini ozgartirish' })
  async changeSubscriptionStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionStatusDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.tariffsService.changeSubscriptionStatus(
      id,
      dto,
      user,
      request,
    );
    return successResponse('Subscription statusi yangilandi', data);
  }
}

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
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PayPaymentDto } from './dto/pay-payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Tolov yaratish' })
  async create(
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.paymentsService.create(dto, user, request);
    return successResponse('Tolov yaratildi', data);
  }

  @Get()
  @ApiOperation({ summary: 'Tolovlar royxati' })
  async findAll(
    @Query() query: PaymentQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.paymentsService.findAll(query, user);
    return paginatedResponse(result.data, result.meta);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta tolov' })
  async findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    const data = await this.paymentsService.findOne(id, user);
    return successResponse('Tolov topildi', data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Tolovni yangilash' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.paymentsService.update(id, dto, user, request);
    return successResponse('Tolov yangilandi', data);
  }

  @Patch(':id/delete')
  @ApiOperation({ summary: 'Tolovni soft delete qilish' })
  async softDelete(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.paymentsService.softDelete(id, user, request);
    return successResponse('Tolov ochirildi', data);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Tolov qabul qilish (qism-qism)' })
  async pay(
    @Param('id') id: string,
    @Body() dto: PayPaymentDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.paymentsService.pay(id, dto, user, request);
    return successResponse('Tolov qabul qilindi', data);
  }

  @Get('stats/summary')
  @ApiOperation({ summary: 'Tolov statistikasi' })
  async stats(
    @Query() query: PaymentQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.paymentsService.stats(query, user);
    return successResponse('Tolov statistikasi', data);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Student boyicha tolovlar' })
  async student(
    @Param('studentId') studentId: string,
    @Query() query: PaymentQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.paymentsService.byStudent(studentId, query, user);
    return paginatedResponse(result.data, result.meta);
  }

  @Get('history/:paymentId')
  @ApiOperation({ summary: 'Tolov tarixi' })
  async history(
    @Param('paymentId') paymentId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.paymentsService.history(paymentId, user);
    return successResponse('Tolov tarixi', data);
  }
}

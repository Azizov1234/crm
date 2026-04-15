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
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseQueryDto } from './dto/expense-query.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { FinanceService } from './finance.service';

@ApiTags('Finance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('expenses')
  @ApiOperation({ summary: 'Xarajat yaratish' })
  async createExpense(
    @Body() dto: CreateExpenseDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.financeService.createExpense(dto, user, request);
    return successResponse('Xarajat yaratildi', data);
  }

  @Get('expenses')
  @ApiOperation({ summary: 'Xarajatlar royxati' })
  async findExpenses(
    @Query() query: ExpenseQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.financeService.findExpenses(query, user);
    return paginatedResponse(result.data, result.meta);
  }

  @Patch('expenses/:id')
  @ApiOperation({ summary: 'Xarajatni yangilash' })
  async updateExpense(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.financeService.updateExpense(
      id,
      dto,
      user,
      request,
    );
    return successResponse('Xarajat yangilandi', data);
  }

  @Patch('expenses/:id/delete')
  @ApiOperation({ summary: 'Xarajatni soft delete qilish' })
  async deleteExpense(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.financeService.softDeleteExpense(id, user, request);
    return successResponse('Xarajat ochirildi', data);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Moliya summary' })
  async summary(
    @Query() query: ExpenseQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.financeService.summary(query, user);
    return successResponse('Moliya summary', data);
  }

  @Get('cashflow')
  @ApiOperation({ summary: 'Cashflow' })
  async cashflow(
    @Query() query: ExpenseQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.financeService.cashflow(query, user);
    return successResponse('Cashflow', data);
  }
}

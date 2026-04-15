import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ActionType, Status, UserRole } from '@prisma/client';
import type { Request } from 'express';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { AuditLogService } from '../../common/services/audit-log.service';
import { BranchScopeService } from '../../common/services/branch-scope.service';
import { EntityCheckService } from '../../common/services/entity-check.service';
import { parsePagination } from '../../common/utils/query.util';
import { PrismaService } from '../../core/prisma/prisma.service';
import { SmsService } from '../sms/sms.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseQueryDto } from './dto/expense-query.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly branchScopeService: BranchScopeService,
    private readonly entityCheckService: EntityCheckService,
    private readonly auditLogService: AuditLogService,
    private readonly smsService: SmsService,
  ) {}

  private async findScopedExpense(id: string, user: RequestUser) {
    const expense = await this.prisma.expense.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
        ...(user.role === UserRole.SUPER_ADMIN
          ? {}
          : user.branchId
            ? { branchId: user.branchId }
            : {}),
      },
    });

    if (!expense) {
      throw new BadRequestException('Xarajat topilmadi');
    }

    return expense;
  }

  private isSalaryCategory(category: string): boolean {
    const value = category.toLowerCase();
    return (
      value.includes('salary') ||
      value.includes('oylik') ||
      value.includes('maosh')
    );
  }

  private async notifyStaffSalaryIfNeeded(
    expense: {
      paidBy: string | null;
      category: string;
      amount: unknown;
      note: string | null;
      expenseDate: Date;
      branchId: string;
    },
    user: RequestUser,
    request?: Request,
  ) {
    if (!expense.paidBy || !this.isSalaryCategory(expense.category)) {
      return;
    }

    const amount = Number(expense.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    try {
      await this.smsService.sendStaffSalaryNotification(
        {
          staffUserId: expense.paidBy,
          amount,
          month: expense.expenseDate.getMonth() + 1,
          year: expense.expenseDate.getFullYear(),
          note: expense.note ?? undefined,
          branchId: expense.branchId,
          provider: 'staff-salary-auto',
        },
        user,
        request,
      );
    } catch (error) {
      this.logger.warn(
        error instanceof Error
          ? `Xodim salary notification yuborilmadi: ${error.message}`
          : 'Xodim salary notification yuborilmadi',
      );
    }
  }

  async createExpense(
    dto: CreateExpenseDto,
    user: RequestUser,
    request?: Request,
  ) {
    const branchId = this.branchScopeService.ensureBranchForCreate(
      user,
      dto.branchId,
    );
    await this.entityCheckService.ensureBranchExists(branchId, user.organizationId, {
      actor: user,
    });

    const data = await this.prisma.expense.create({
      data: {
        organizationId: user.organizationId,
        branchId,
        title: dto.title,
        category: dto.category,
        amount: dto.amount,
        expenseDate: new Date(dto.expenseDate),
        paidBy: dto.paidBy ?? null,
        note: dto.note ?? null,
        fileUrl: dto.fileUrl ?? null,
      },
    });

    await this.notifyStaffSalaryIfNeeded(data, user, request);

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.CREATE,
      entityType: 'Expense',
      entityId: data.id,
      description: 'Xarajat yaratildi',
      newData: data,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return data;
  }

  async findExpenses(query: ExpenseQueryDto, user: RequestUser) {
    const { page, limit, skip, take } = parsePagination(query);

    const where: any = {
      organizationId: user.organizationId,
      ...(user.role === UserRole.SUPER_ADMIN
        ? query.branchId
          ? { branchId: query.branchId }
          : {}
        : user.branchId
          ? { branchId: user.branchId }
          : {}),
      ...(query.includeDeleted ? {} : { status: { not: Status.DELETED } }),
      ...(query.status ? { status: query.status } : {}),
      ...(query.from || query.to
        ? {
            expenseDate: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { category: { contains: query.search, mode: 'insensitive' } },
        { note: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        orderBy: { expenseDate: 'desc' },
        skip,
        take,
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async updateExpense(
    id: string,
    dto: UpdateExpenseDto,
    user: RequestUser,
    request?: Request,
  ) {
    const existing = await this.findScopedExpense(id, user);
    const nextBranchId =
      dto.branchId !== undefined
        ? this.branchScopeService.resolveBranchId(user, dto.branchId) ??
          existing.branchId
        : existing.branchId;
    await this.entityCheckService.ensureBranchExists(
      nextBranchId,
      user.organizationId,
      {
        actor: user,
      },
    );

    const payload: any = {
      ...(dto.title ? { title: dto.title } : {}),
      ...(dto.category ? { category: dto.category } : {}),
      ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
      ...(dto.expenseDate ? { expenseDate: new Date(dto.expenseDate) } : {}),
      ...(dto.paidBy !== undefined ? { paidBy: dto.paidBy } : {}),
      ...(dto.note !== undefined ? { note: dto.note } : {}),
      ...(dto.fileUrl !== undefined ? { fileUrl: dto.fileUrl } : {}),
    };

    payload.branchId = nextBranchId;

    const data = await this.prisma.expense.update({
      where: { id },
      data: payload,
    });

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.UPDATE,
      entityType: 'Expense',
      entityId: id,
      description: 'Xarajat yangilandi',
      oldData: existing,
      newData: data,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return data;
  }

  async softDeleteExpense(id: string, user: RequestUser, request?: Request) {
    const existing = await this.findScopedExpense(id, user);

    const data = await this.prisma.expense.update({
      where: { id },
      data: {
        status: Status.DELETED,
        deletedAt: new Date(),
      },
    });

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.DELETE,
      entityType: 'Expense',
      entityId: id,
      description: 'Xarajat ochirildi',
      oldData: existing,
      newData: data,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return data;
  }

  async summary(query: ExpenseQueryDto, user: RequestUser) {
    const branchFilter =
      user.role === UserRole.SUPER_ADMIN
        ? query.branchId
          ? { branchId: query.branchId }
          : {}
        : user.branchId
          ? { branchId: user.branchId }
          : {};

    const dateFilter =
      query.from || query.to
        ? {
            gte: query.from ? new Date(query.from) : undefined,
            lte: query.to ? new Date(query.to) : undefined,
          }
        : undefined;

    const [expenseAgg, incomeAgg] = await Promise.all([
      this.prisma.expense.aggregate({
        where: {
          organizationId: user.organizationId,
          ...branchFilter,
          status: { not: Status.DELETED },
          ...(dateFilter ? { expenseDate: dateFilter } : {}),
        },
        _sum: { amount: true },
      }),
      this.prisma.paymentHistory.aggregate({
        where: {
          organizationId: user.organizationId,
          ...branchFilter,
          status: { not: Status.DELETED },
          ...(dateFilter ? { paidAt: dateFilter } : {}),
        },
        _sum: { amount: true },
      }),
    ]);

    const income = Number(incomeAgg._sum?.amount ?? 0);
    const expense = Number(expenseAgg._sum?.amount ?? 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  }

  async cashflow(query: ExpenseQueryDto, user: RequestUser) {
    const branchFilter =
      user.role === UserRole.SUPER_ADMIN
        ? query.branchId
          ? { branchId: query.branchId }
          : {}
        : user.branchId
          ? { branchId: user.branchId }
          : {};

    const incomes = await this.prisma.paymentHistory.findMany({
      where: {
        organizationId: user.organizationId,
        ...branchFilter,
        status: { not: Status.DELETED },
        ...(query.from || query.to
          ? {
              paidAt: {
                ...(query.from ? { gte: new Date(query.from) } : {}),
                ...(query.to ? { lte: new Date(query.to) } : {}),
              },
            }
          : {}),
      },
      select: {
        paidAt: true,
        amount: true,
      },
    });

    const expenses = await this.prisma.expense.findMany({
      where: {
        organizationId: user.organizationId,
        ...branchFilter,
        status: { not: Status.DELETED },
        ...(query.from || query.to
          ? {
              expenseDate: {
                ...(query.from ? { gte: new Date(query.from) } : {}),
                ...(query.to ? { lte: new Date(query.to) } : {}),
              },
            }
          : {}),
      },
      select: {
        expenseDate: true,
        amount: true,
      },
    });

    const map = new Map<string, { income: number; expense: number }>();

    for (const item of incomes) {
      const key = `${item.paidAt.getFullYear()}-${String(item.paidAt.getMonth() + 1).padStart(2, '0')}`;
      const current = map.get(key) ?? { income: 0, expense: 0 };
      current.income += Number(item.amount);
      map.set(key, current);
    }

    for (const item of expenses) {
      const key = `${item.expenseDate.getFullYear()}-${String(item.expenseDate.getMonth() + 1).padStart(2, '0')}`;
      const current = map.get(key) ?? { income: 0, expense: 0 };
      current.expense += Number(item.amount);
      map.set(key, current);
    }

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, values]) => ({
        month,
        income: values.income,
        expense: values.expense,
        balance: values.income - values.expense,
      }));
  }
}


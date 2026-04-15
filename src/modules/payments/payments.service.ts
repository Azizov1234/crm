import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActionType, PaymentStatus, Status, UserRole } from '@prisma/client';
import type { Request } from 'express';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { AuditLogService } from '../../common/services/audit-log.service';
import { BranchScopeService } from '../../common/services/branch-scope.service';
import { EntityCheckService } from '../../common/services/entity-check.service';
import { parsePagination } from '../../common/utils/query.util';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PayPaymentDto } from './dto/pay-payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly branchScopeService: BranchScopeService,
    private readonly entityCheckService: EntityCheckService,
    private readonly auditLogService: AuditLogService,
  ) {}

  private validateAmounts(amount: number, paidAmount: number) {
    if (amount <= 0) {
      throw new BadRequestException('amount 0 dan katta bolishi kerak');
    }

    if (paidAmount < 0) {
      throw new BadRequestException('paidAmount manfiy bolishi mumkin emas');
    }

    if (paidAmount > amount) {
      throw new BadRequestException('paidAmount amountdan katta bolishi mumkin emas');
    }
  }

  private resolvePaymentStatus(
    amount: number,
    paidAmount: number,
  ): PaymentStatus {
    if (paidAmount <= 0) {
      return PaymentStatus.PENDING;
    }

    if (paidAmount < amount) {
      return PaymentStatus.PARTIAL;
    }

    return PaymentStatus.PAID;
  }

  private async ensureStudentInGroup(studentId: string, groupId: string) {
    const link = await this.prisma.groupStudent.findFirst({
      where: {
        studentId,
        groupId,
        status: { not: Status.DELETED },
      },
    });

    if (!link) {
      throw new BadRequestException('Oquvchi ushbu guruhga biriktirilmagan');
    }
  }

  private async findScopedPayment(
    id: string,
    user: RequestUser,
    includeDeleted = false,
  ) {
    const data = await this.prisma.payment.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
        ...(user.role === UserRole.SUPER_ADMIN
          ? {}
          : user.branchId
            ? { branchId: user.branchId }
            : {}),
        ...(includeDeleted ? {} : { status: { not: Status.DELETED } }),
      },
      include: {
        student: { include: { user: true } },
        group: true,
        histories: true,
      },
    });

    if (!data) {
      throw new NotFoundException('Tolov topilmadi');
    }

    return data;
  }

  async create(dto: CreatePaymentDto, user: RequestUser, request?: Request) {
    const branchId = this.branchScopeService.ensureBranchForCreate(
      user,
      dto.branchId,
    );
    await this.entityCheckService.ensureBranchExists(branchId, user.organizationId, {
      actor: user,
    });
    await this.entityCheckService.ensureStudentExists(
      dto.studentId,
      user.organizationId,
      {
        actor: user,
        expectedBranchId: branchId,
      },
    );
    if (dto.groupId) {
      await this.entityCheckService.ensureGroupExists(dto.groupId, user.organizationId, {
        actor: user,
        expectedBranchId: branchId,
      });
      await this.ensureStudentInGroup(dto.studentId, dto.groupId);
    }

    const paidAmount = dto.paidAmount ?? 0;
    this.validateAmounts(dto.amount, paidAmount);
    const status =
      dto.paymentStatus ?? this.resolvePaymentStatus(dto.amount, paidAmount);

    const data = await this.prisma.payment.create({
      data: {
        organizationId: user.organizationId,
        branchId,
        studentId: dto.studentId,
        groupId: dto.groupId ?? null,
        month: dto.month,
        year: dto.year,
        amount: dto.amount,
        paidAmount,
        paymentStatus: status,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        note: dto.note ?? null,
        fileUrl: dto.fileUrl ?? null,
      },
      include: {
        student: { include: { user: true } },
      },
    });

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.CREATE,
      entityType: 'Payment',
      entityId: data.id,
      description: 'Tolov yaratildi',
      newData: data,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return data;
  }

  async findAll(query: PaymentQueryDto, user: RequestUser) {
    const { page, limit, skip, take } = parsePagination(query);

    const where: Record<string, unknown> = {
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
      ...(query.paymentStatus ? { paymentStatus: query.paymentStatus } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    if (query.search) {
      where.OR = [
        { note: { contains: query.search, mode: 'insensitive' } },
        {
          student: {
            user: {
              firstName: { contains: query.search, mode: 'insensitive' },
            },
          },
        },
        {
          student: {
            user: { lastName: { contains: query.search, mode: 'insensitive' } },
          },
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          student: { include: { user: true } },
          group: true,
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        skip,
        take,
      }),
      this.prisma.payment.count({ where }),
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

  async findOne(id: string, user: RequestUser) {
    return this.findScopedPayment(id, user);
  }

  async update(
    id: string,
    dto: UpdatePaymentDto,
    user: RequestUser,
    request?: Request,
  ) {
    const existing = await this.findScopedPayment(id, user, true);
    const nextBranchId =
      dto.branchId !== undefined
        ? this.branchScopeService.resolveBranchId(user, dto.branchId) ??
          existing.branchId
        : existing.branchId;
    const nextStudentId = dto.studentId ?? existing.studentId;
    const nextGroupId = dto.groupId !== undefined ? dto.groupId : existing.groupId;
    const nextAmount = Number(dto.amount ?? existing.amount);
    const nextPaidAmount = Number(dto.paidAmount ?? existing.paidAmount);

    await this.entityCheckService.ensureStudentExists(
      nextStudentId,
      user.organizationId,
      {
        actor: user,
        expectedBranchId: nextBranchId,
      },
    );
    if (nextGroupId) {
      await this.entityCheckService.ensureGroupExists(
        nextGroupId,
        user.organizationId,
        {
          actor: user,
          expectedBranchId: nextBranchId,
        },
      );
      await this.ensureStudentInGroup(nextStudentId, nextGroupId);
    }

    this.validateAmounts(nextAmount, nextPaidAmount);

    const payload: Record<string, unknown> = {
      ...(dto.studentId ? { studentId: dto.studentId } : {}),
      ...(dto.groupId !== undefined ? { groupId: dto.groupId } : {}),
      ...(dto.month !== undefined ? { month: dto.month } : {}),
      ...(dto.year !== undefined ? { year: dto.year } : {}),
      ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
      ...(dto.paidAmount !== undefined ? { paidAmount: dto.paidAmount } : {}),
      ...(dto.note !== undefined ? { note: dto.note } : {}),
      ...(dto.fileUrl !== undefined ? { fileUrl: dto.fileUrl } : {}),
      ...(dto.dueDate !== undefined
        ? { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }
        : {}),
      branchId: nextBranchId,
      paymentStatus:
        dto.paymentStatus ?? this.resolvePaymentStatus(nextAmount, nextPaidAmount),
    };

    const data = await this.prisma.payment.update({
      where: { id },
      data: payload,
    });

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.UPDATE,
      entityType: 'Payment',
      entityId: id,
      description: 'Tolov yangilandi',
      oldData: existing,
      newData: data,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return data;
  }

  async softDelete(id: string, user: RequestUser, request?: Request) {
    const existing = await this.findScopedPayment(id, user, true);

    const data = await this.prisma.payment.update({
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
      entityType: 'Payment',
      entityId: id,
      description: 'Tolov ochirildi',
      oldData: existing,
      newData: data,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return data;
  }

  async pay(
    id: string,
    dto: PayPaymentDto,
    user: RequestUser,
    request?: Request,
  ) {
    const payment = await this.findScopedPayment(id, user, true);

    if (payment.status === Status.DELETED) {
      throw new BadRequestException(
        'Ochirib yuborilgan tolovga tolov qabul qilib bolmaydi',
      );
    }

    if (dto.amount <= 0) {
      throw new BadRequestException('Tolov summasi 0 dan katta bolishi kerak');
    }

    const totalAmount = Number(payment.amount);
    const newPaidAmount = Number(payment.paidAmount) + dto.amount;
    if (newPaidAmount > totalAmount) {
      throw new BadRequestException('Tolov summasi qarzdorlikdan oshib ketdi');
    }

    const paymentStatus = this.resolvePaymentStatus(totalAmount, newPaidAmount);

    const data = await this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: {
          paidAmount: newPaidAmount,
          paymentStatus,
        },
      });

      const history = await tx.paymentHistory.create({
        data: {
          organizationId: user.organizationId,
          branchId: payment.branchId,
          paymentId: id,
          amount: dto.amount,
          paymentStatus,
          method: dto.method,
          referenceNo: dto.referenceNo ?? null,
          receivedById: user.id,
          note: dto.note ?? null,
        },
      });

      return {
        payment: updatedPayment,
        history,
      };
    });

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.PAYMENT,
      entityType: 'PaymentHistory',
      entityId: data.history.id,
      description: 'Tolov qabul qilindi',
      newData: data,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return data;
  }

  async stats(query: PaymentQueryDto, user: RequestUser) {
    const where: Record<string, unknown> = {
      organizationId: user.organizationId,
      ...(user.role === UserRole.SUPER_ADMIN
        ? query.branchId
          ? { branchId: query.branchId }
          : {}
        : user.branchId
          ? { branchId: user.branchId }
          : {}),
      status: { not: Status.DELETED },
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const [aggregate, grouped] = await Promise.all([
      this.prisma.payment.aggregate({
        where,
        _sum: {
          amount: true,
          paidAmount: true,
        },
        _count: {
          _all: true,
        },
      }),
      this.prisma.payment.groupBy({
        by: ['paymentStatus'],
        where,
        _count: {
          _all: true,
        },
        _sum: {
          amount: true,
          paidAmount: true,
        },
      }),
    ]);

    return {
      total: Number(aggregate._sum.amount ?? 0),
      collected: Number(aggregate._sum.paidAmount ?? 0),
      remaining:
        Number(aggregate._sum.amount ?? 0) -
        Number(aggregate._sum.paidAmount ?? 0),
      count: aggregate._count._all,
      byStatus: grouped.map((item) => ({
        status: item.paymentStatus,
        count: item._count._all,
        amount: Number(item._sum.amount ?? 0),
        paidAmount: Number(item._sum.paidAmount ?? 0),
      })),
    };
  }

  async byStudent(
    studentId: string,
    query: PaymentQueryDto,
    user: RequestUser,
  ) {
    await this.entityCheckService.ensureStudentExists(
      studentId,
      user.organizationId,
      {
        actor: user,
        allowInactive: true,
      },
    );
    return this.findAll({ ...query, studentId }, user);
  }

  async history(paymentId: string, user: RequestUser) {
    await this.findScopedPayment(paymentId, user, true);

    return this.prisma.paymentHistory.findMany({
      where: {
        paymentId,
        organizationId: user.organizationId,
        ...(user.role === UserRole.SUPER_ADMIN
          ? {}
          : user.branchId
            ? { branchId: user.branchId }
            : {}),
        status: { not: Status.DELETED },
      },
      include: {
        receivedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { paidAt: 'desc' },
    });
  }
}

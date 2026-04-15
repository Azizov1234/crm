import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ActionType,
  PaymentStatus,
  SmsStatus,
  Status,
  UserRole,
} from '@prisma/client';
import type { Request } from 'express';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { AuditLogService } from '../../common/services/audit-log.service';
import { BranchScopeService } from '../../common/services/branch-scope.service';
import { EntityCheckService } from '../../common/services/entity-check.service';
import { parsePagination } from '../../common/utils/query.util';
import { PrismaService } from '../../core/prisma/prisma.service';
import { BulkSendSmsDto } from './dto/bulk-send-sms.dto';
import { CreateSmsTemplateDto } from './dto/create-sms-template.dto';
import { SendDuePaymentRemindersDto } from './dto/send-due-payment-reminders.dto';
import { SendRoleNotificationDto } from './dto/send-role-notification.dto';
import { SendSmsDto } from './dto/send-sms.dto';
import { SendStaffSalaryNotificationDto } from './dto/send-staff-salary-notification.dto';
import { SmsLogQueryDto } from './dto/sms-log-query.dto';
import { UpdateSmsTemplateDto } from './dto/update-sms-template.dto';

@Injectable()
export class SmsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly branchScopeService: BranchScopeService,
    private readonly entityCheckService: EntityCheckService,
    private readonly auditLogService: AuditLogService,
  ) {}

  private async findScopedTemplate(id: string, user: RequestUser) {
    const template = await this.prisma.smsTemplate.findFirst({
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

    if (!template) {
      throw new BadRequestException('Template topilmadi');
    }

    return template;
  }

  private getScopedBranchFilter(
    user: RequestUser,
    branchId?: string,
  ): Record<string, unknown> {
    if (user.role === UserRole.SUPER_ADMIN) {
      return branchId ? { branchId } : {};
    }

    if (!user.branchId) {
      throw new BadRequestException('Sizga filial biriktirilmagan');
    }

    if (branchId && branchId !== user.branchId) {
      throw new BadRequestException('Boshqa filialga ruxsat yoq');
    }

    return { branchId: user.branchId };
  }

  private resolveBranchIdForCreate(
    user: RequestUser,
    branchId?: string | null,
  ): string {
    const resolved = this.branchScopeService.resolveBranchId(
      user,
      branchId ?? undefined,
    );
    if (!resolved) {
      throw new BadRequestException('branchId majburiy');
    }
    return resolved;
  }

  private async createSmsLogs(
    rows: Array<{
      branchId: string;
      recipientPhone: string;
      message: string;
      provider?: string | null;
      senderId?: string | null;
    }>,
    organizationId: string,
  ) {
    if (!rows.length) return 0;

    const result = await this.prisma.smsLog.createMany({
      data: rows.map((row) => ({
        organizationId,
        branchId: row.branchId,
        senderId: row.senderId ?? null,
        recipientPhone: row.recipientPhone,
        message: row.message,
        provider: row.provider ?? 'notification-system',
        smsStatus: SmsStatus.SENT,
      })),
    });

    return result.count;
  }

  async send(dto: SendSmsDto, user: RequestUser, request?: Request) {
    const branchId = this.branchScopeService.ensureBranchForCreate(
      user,
      dto.branchId,
    );
    await this.entityCheckService.ensureBranchExists(branchId, user.organizationId, {
      actor: user,
    });

    const log = await this.prisma.smsLog.create({
      data: {
        organizationId: user.organizationId,
        branchId,
        senderId: user.id,
        recipientPhone: dto.recipientPhone,
        message: dto.message,
        provider: dto.provider ?? 'mock-provider',
        smsStatus: SmsStatus.SENT,
      },
    });

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.CREATE,
      entityType: 'SmsLog',
      entityId: log.id,
      description: 'SMS yuborildi',
      newData: log,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return log;
  }

  async bulkSend(dto: BulkSendSmsDto, user: RequestUser, request?: Request) {
    const branchId = this.branchScopeService.ensureBranchForCreate(
      user,
      dto.branchId,
    );
    await this.entityCheckService.ensureBranchExists(branchId, user.organizationId, {
      actor: user,
    });

    const rows = await this.prisma.$transaction(
      dto.recipients.map((recipientPhone) =>
        this.prisma.smsLog.create({
          data: {
            organizationId: user.organizationId,
            branchId,
            senderId: user.id,
            recipientPhone,
            message: dto.message,
            provider: dto.provider ?? 'mock-provider',
            smsStatus: SmsStatus.SENT,
          },
        }),
      ),
    );

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.CREATE,
      entityType: 'SmsLog',
      description: 'Bulk SMS yuborildi',
      newData: { count: rows.length },
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return rows;
  }

  async sendRoleNotification(
    dto: SendRoleNotificationDto,
    user: RequestUser,
    request?: Request,
  ) {
    const branchFilter = this.getScopedBranchFilter(user, dto.branchId);
    const recipients = await this.prisma.user.findMany({
      where: {
        organizationId: user.organizationId,
        role: { in: dto.roles },
        status: Status.ACTIVE,
        deletedAt: null,
        ...branchFilter,
      },
      select: {
        id: true,
        phone: true,
        branchId: true,
      },
    });

    const validRecipients = recipients.filter(
      (item) => item.phone?.trim() && item.branchId,
    );
    const rows = validRecipients.map((item) => ({
      branchId: item.branchId as string,
      recipientPhone: item.phone as string,
      message: dto.message,
      provider: dto.provider ?? 'notification-role-broadcast',
      senderId: user.id,
    }));

    const sentCount = await this.createSmsLogs(rows, user.organizationId);

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.CREATE,
      entityType: 'NotificationRoleBroadcast',
      description: 'Role boyicha notification yuborildi',
      newData: {
        roles: dto.roles,
        totalTargets: recipients.length,
        sentCount,
        skippedCount: recipients.length - sentCount,
      },
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return {
      totalTargets: recipients.length,
      sentCount,
      skippedCount: recipients.length - sentCount,
    };
  }

  async sendDuePaymentReminders(
    dto: SendDuePaymentRemindersDto,
    user: RequestUser,
    request?: Request,
  ) {
    const daysAhead = dto.daysAhead ?? 3;
    const now = new Date();
    const until = new Date();
    until.setDate(until.getDate() + daysAhead);

    const branchFilter = this.getScopedBranchFilter(user, dto.branchId);
    const payments = await this.prisma.payment.findMany({
      where: {
        organizationId: user.organizationId,
        dueDate: {
          gte: now,
          lte: until,
        },
        paymentStatus: {
          in: [
            PaymentStatus.PENDING,
            PaymentStatus.PARTIAL,
            PaymentStatus.OVERDUE,
          ],
        },
        status: { not: Status.DELETED },
        ...branchFilter,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
        group: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    const rows = payments
      .map((payment) => {
        const phone = payment.student.user.phone?.trim();
        if (!phone) return null;

        const amount = Number(payment.amount);
        const paidAmount = Number(payment.paidAmount);
        const remaining = Math.max(amount - paidAmount, 0);
        const fullName = `${payment.student.user.firstName} ${payment.student.user.lastName}`.trim();
        const dueDateText = payment.dueDate?.toISOString().slice(0, 10) ?? '-';
        const message = `${fullName}, ${payment.month}/${payment.year} oylik tolov muddati ${dueDateText}. Qolgan summa: ${remaining.toFixed(0)} UZS.${payment.group?.name ? ` Guruh: ${payment.group.name}.` : ''}`;

        return {
          branchId: payment.branchId,
          recipientPhone: phone,
          message,
          provider: dto.provider ?? 'payment-due-reminder',
          senderId: user.id,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    const sentCount = await this.createSmsLogs(rows, user.organizationId);

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.CREATE,
      entityType: 'PaymentDueReminder',
      description: 'Tolov muddati yaqinlashganlar uchun reminder yuborildi',
      newData: {
        daysAhead,
        totalTargets: payments.length,
        sentCount,
        skippedCount: payments.length - sentCount,
      },
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return {
      daysAhead,
      totalTargets: payments.length,
      sentCount,
      skippedCount: payments.length - sentCount,
    };
  }

  async sendStaffSalaryNotification(
    dto: SendStaffSalaryNotificationDto,
    user: RequestUser,
    request?: Request,
  ) {
    const staffUser = await this.prisma.user.findFirst({
      where: {
        id: dto.staffUserId,
        organizationId: user.organizationId,
        role: UserRole.STAFF,
        status: Status.ACTIVE,
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        branchId: true,
      },
    });

    if (!staffUser) {
      throw new BadRequestException('Xodim topilmadi');
    }
    if (!staffUser.phone?.trim()) {
      throw new BadRequestException('Xodim telefon raqami mavjud emas');
    }

    const branchId = this.resolveBranchIdForCreate(
      user,
      dto.branchId ?? user.branchId ?? staffUser.branchId ?? undefined,
    );
    await this.entityCheckService.ensureBranchExists(
      branchId,
      user.organizationId,
      {
        actor: user,
      },
    );

    const month = dto.month ?? new Date().getMonth() + 1;
    const year = dto.year ?? new Date().getFullYear();
    const fullName = `${staffUser.firstName} ${staffUser.lastName}`.trim();
    const message = `${fullName}, ${month}/${year} oylik tolovingiz tasdiqlandi. Summa: ${dto.amount.toFixed(0)} UZS.${dto.note ? ` Izoh: ${dto.note}` : ''}`;

    const sentCount = await this.createSmsLogs(
      [
        {
          branchId,
          recipientPhone: staffUser.phone,
          message,
          provider: dto.provider ?? 'staff-salary-notification',
          senderId: user.id,
        },
      ],
      user.organizationId,
    );

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.CREATE,
      entityType: 'StaffSalaryNotification',
      description: 'Xodim oylik tolov notification yuborildi',
      newData: {
        staffUserId: staffUser.id,
        amount: dto.amount,
        sentCount,
      },
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return {
      sentCount,
      staffUserId: staffUser.id,
      staffName: fullName,
      amount: dto.amount,
    };
  }

  async logs(query: SmsLogQueryDto, user: RequestUser) {
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
      ...(query.smsStatus ? { smsStatus: query.smsStatus } : {}),
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
        { recipientPhone: { contains: query.search, mode: 'insensitive' } },
        { message: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.smsLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.smsLog.count({ where }),
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

  async templates(query: SmsLogQueryDto, user: RequestUser) {
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
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { body: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.smsTemplate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.smsTemplate.count({ where }),
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

  async createTemplate(
    dto: CreateSmsTemplateDto,
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

    const data = await this.prisma.smsTemplate.create({
      data: {
        organizationId: user.organizationId,
        branchId,
        name: dto.name,
        body: dto.body,
      },
    });

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.CREATE,
      entityType: 'SmsTemplate',
      entityId: data.id,
      description: 'SMS template yaratildi',
      newData: data,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return data;
  }

  async updateTemplate(
    id: string,
    dto: UpdateSmsTemplateDto,
    user: RequestUser,
    request?: Request,
  ) {
    const existing = await this.findScopedTemplate(id, user);
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
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.body !== undefined ? { body: dto.body } : {}),
    };

    payload.branchId = nextBranchId;

    const data = await this.prisma.smsTemplate.update({
      where: { id },
      data: payload,
    });

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.UPDATE,
      entityType: 'SmsTemplate',
      entityId: id,
      description: 'SMS template yangilandi',
      oldData: existing,
      newData: data,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return data;
  }

  async deleteTemplate(id: string, user: RequestUser, request?: Request) {
    const existing = await this.findScopedTemplate(id, user);

    const data = await this.prisma.smsTemplate.update({
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
      entityType: 'SmsTemplate',
      entityId: id,
      description: 'SMS template ochirildi',
      oldData: existing,
      newData: data,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return data;
  }
}

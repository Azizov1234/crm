import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ActionType,
  Status,
  SubscriptionStatus,
  UserRole,
} from '@prisma/client';
import type { Request } from 'express';
import { BaseQueryDto } from '../../common/dto/base-query.dto';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { AuditLogService } from '../../common/services/audit-log.service';
import { EntityCheckService } from '../../common/services/entity-check.service';
import { parsePagination } from '../../common/utils/query.util';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreateTariffPlanDto } from './dto/create-tariff-plan.dto';
import { UpdateSubscriptionStatusDto } from './dto/update-subscription-status.dto';
import { UpdateTariffPlanDto } from './dto/update-tariff-plan.dto';

@Injectable()
export class TariffsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entityCheckService: EntityCheckService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async createPlan(
    dto: CreateTariffPlanDto,
    user: RequestUser,
    request?: Request,
  ) {
    const data = await this.prisma.tariffPlan.create({
      data: {
        organizationId: user.organizationId,
        name: dto.name,
        price: dto.price,
        durationDays: dto.durationDays,
        studentLimit: dto.studentLimit,
        branchLimit: dto.branchLimit,
        features: dto.features as never,
      },
    });

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.CREATE,
      entityType: 'TariffPlan',
      entityId: data.id,
      description: 'Tariff plan yaratildi',
      newData: data,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return data;
  }

  async findPlans(query: BaseQueryDto, user: RequestUser) {
    const { page, limit, skip, take } = parsePagination(query);

    const where: any = {
      organizationId: user.organizationId,
      ...(query.includeDeleted ? {} : { status: { not: Status.DELETED } }),
      ...(query.status ? { status: query.status } : {}),
    };

    if (query.search) {
      where.OR = [{ name: { contains: query.search, mode: 'insensitive' } }];
    }

    const [data, total] = await Promise.all([
      this.prisma.tariffPlan.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.tariffPlan.count({ where }),
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

  async findPlan(id: string, user: RequestUser) {
    const data = await this.prisma.tariffPlan.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
        status: { not: Status.DELETED },
      },
    });

    if (!data) {
      throw new NotFoundException('Tariff plan topilmadi');
    }

    return data;
  }

  async updatePlan(
    id: string,
    dto: UpdateTariffPlanDto,
    user: RequestUser,
    request?: Request,
  ) {
    const existing = await this.findPlan(id, user);
    const payload: any = { ...dto };
    if (dto.features !== undefined) {
      payload.features = dto.features as never;
    }

    const data = await this.prisma.tariffPlan.update({
      where: { id },
      data: payload,
    });

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.UPDATE,
      entityType: 'TariffPlan',
      entityId: id,
      description: 'Tariff plan yangilandi',
      oldData: existing,
      newData: data,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return data;
  }

  async deletePlan(id: string, user: RequestUser, request?: Request) {
    const existing = await this.findPlan(id, user);

    const data = await this.prisma.tariffPlan.update({
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
      entityType: 'TariffPlan',
      entityId: id,
      description: 'Tariff plan ochirildi',
      oldData: existing,
      newData: data,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return data;
  }

  async createSubscription(
    dto: CreateSubscriptionDto,
    user: RequestUser,
    request?: Request,
  ) {
    await this.entityCheckService.ensureTariffPlanExists(
      dto.tariffPlanId,
      user.organizationId,
    );

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (startDate > endDate) {
      throw new BadRequestException('endDate startDate dan oldin bolishi mumkin emas');
    }

    const data = await this.prisma.subscription.create({
      data: {
        organizationId: user.organizationId,
        tariffPlanId: dto.tariffPlanId,
        startDate,
        endDate,
        subscriptionStatus: dto.subscriptionStatus ?? SubscriptionStatus.ACTIVE,
        autoRenew: dto.autoRenew ?? false,
      },
      include: {
        tariffPlan: true,
      },
    });

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.CREATE,
      entityType: 'Subscription',
      entityId: data.id,
      description: 'Subscription yaratildi',
      newData: data,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return data;
  }

  async findSubscriptions(query: BaseQueryDto, user: RequestUser) {
    const { page, limit, skip, take } = parsePagination(query);

    const where: any = {
      organizationId: user.organizationId,
      ...(query.includeDeleted ? {} : { status: { not: Status.DELETED } }),
      ...(query.status ? { status: query.status } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        include: {
          tariffPlan: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.subscription.count({ where }),
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

  async currentSubscription(user: RequestUser) {
    return this.prisma.subscription.findFirst({
      where: {
        organizationId: user.organizationId,
        status: { not: Status.DELETED },
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      },
      include: {
        tariffPlan: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async changeSubscriptionStatus(
    id: string,
    dto: UpdateSubscriptionStatusDto,
    user: RequestUser,
    request?: Request,
  ) {
    const existing = await this.prisma.subscription.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
        status: { not: Status.DELETED },
      },
    });

    if (!existing) {
      throw new NotFoundException('Subscription topilmadi');
    }

    const data = await this.prisma.subscription.update({
      where: { id },
      data: {
        subscriptionStatus: dto.subscriptionStatus,
      },
    });

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.UPDATE,
      entityType: 'Subscription',
      entityId: id,
      description: `Subscription statusi ${dto.subscriptionStatus} qilindi`,
      oldData: existing,
      newData: data,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return data;
  }
}

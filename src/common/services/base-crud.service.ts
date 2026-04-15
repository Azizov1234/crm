import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActionType, Status, UserRole } from '@prisma/client';
import type { Request } from 'express';
import { PrismaService } from '../../core/prisma/prisma.service';
import { BaseQueryDto } from '../dto/base-query.dto';
import type { RequestUser } from '../interfaces/request-user.interface';
import { buildListWhere, parsePagination } from '../utils/query.util';
import { AuditLogService } from './audit-log.service';

type PrismaDelegate = {
  create: (args: { data: Record<string, unknown> }) => Promise<any>;
  findMany: (args: {
    where: Record<string, unknown>;
    include?: Record<string, unknown>;
    orderBy?: Record<string, unknown>;
    skip: number;
    take: number;
  }) => Promise<any[]>;
  count: (args: { where: Record<string, unknown> }) => Promise<number>;
  findFirst: (args: {
    where: Record<string, unknown>;
    include?: Record<string, unknown>;
  }) => Promise<Record<string, any> | null>;
  update: (args: {
    where: { id: string };
    data: Record<string, unknown>;
  }) => Promise<Record<string, any>>;
};

@Injectable()
export abstract class BaseCrudService {
  protected abstract readonly model: string;
  protected abstract readonly entityType: string;

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly auditLogService: AuditLogService,
  ) {}

  protected get delegate(): PrismaDelegate {
    return (this.prisma as unknown as Record<string, PrismaDelegate>)[
      this.model
    ] as PrismaDelegate;
  }

  protected buildDefaultWhere(user: RequestUser, query: BaseQueryDto) {
    const baseWhere: Record<string, unknown> = {
      organizationId: user.organizationId,
    };
    const isBranchModel = this.model === 'branch';

    if (user.role === UserRole.SUPER_ADMIN) {
      if (query.branchId) {
        if (isBranchModel) {
          baseWhere.id = query.branchId;
        } else {
          baseWhere.branchId = query.branchId;
        }
      }

      return baseWhere;
    }

    if (!user.branchId) {
      throw new ForbiddenException('Sizga filial biriktirilmagan');
    }

    if (isBranchModel) {
      baseWhere.id = user.branchId;
    } else {
      baseWhere.branchId = user.branchId;
    }
    return baseWhere;
  }

  private ensurePayloadScope(
    user: RequestUser,
    payload: Record<string, unknown>,
    options?: { isCreate?: boolean },
  ) {
    if (
      payload.organizationId !== undefined &&
      payload.organizationId !== user.organizationId
    ) {
      throw new ForbiddenException('Boshqa organization malumotiga ruxsat yoq');
    }

    payload.organizationId = user.organizationId;
    const isBranchModel = this.model === 'branch';

    if (user.role !== UserRole.SUPER_ADMIN) {
      if (!user.branchId) {
        throw new ForbiddenException('Sizga filial biriktirilmagan');
      }

      if (isBranchModel) {
        delete payload.branchId;
        return;
      }

      const requestedBranchId =
        typeof payload.branchId === 'string' ? payload.branchId : undefined;

      if (requestedBranchId && requestedBranchId !== user.branchId) {
        throw new ForbiddenException('Boshqa filialga ruxsat yoq');
      }

      if (options?.isCreate && !requestedBranchId) {
        payload.branchId = user.branchId;
      }
    }
  }

  private async findScopedEntity(id: string, user: RequestUser) {
    return this.delegate.findFirst({
      where: {
        id,
        ...this.buildDefaultWhere(user, {
          page: 1,
          limit: 10,
          includeDeleted: true,
        }),
      },
    });
  }

  async create(
    payload: Record<string, unknown>,
    user: RequestUser,
    request?: Request,
  ): Promise<any> {
    const createPayload = { ...payload };
    this.ensurePayloadScope(user, createPayload, { isCreate: true });

    const created = await this.delegate.create({ data: createPayload });
    const createdId =
      typeof created === 'object' && created && 'id' in created
        ? String((created as { id: string }).id)
        : undefined;

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.CREATE,
      entityType: this.entityType,
      entityId: createdId,
      description: `${this.entityType} yaratildi`,
      newData: created,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return created;
  }

  async findAll(
    query: BaseQueryDto,
    user: RequestUser,
    options?: {
      include?: Record<string, unknown>;
      orderBy?: Record<string, unknown>;
      searchFields?: string[];
      defaultWhere?: Record<string, unknown>;
    },
  ) {
    const { page, limit, skip, take } = parsePagination(query);
    const normalizedQuery =
      this.model === 'branch' ? { ...query, branchId: undefined } : query;
    const where = buildListWhere(normalizedQuery, {
      searchFields: options?.searchFields,
      defaultWhere: {
        ...this.buildDefaultWhere(user, query),
        ...(options?.defaultWhere ?? {}),
      },
    });

    const [data, total] = await Promise.all([
      this.delegate.findMany({
        where,
        include: options?.include,
        orderBy: options?.orderBy ?? { createdAt: 'desc' },
        skip,
        take,
      }),
      this.delegate.count({ where }),
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

  async findOne(
    id: string,
    user: RequestUser,
    options?: {
      include?: Record<string, unknown>;
      includeDeleted?: boolean;
      defaultWhere?: Record<string, unknown>;
    },
  ): Promise<Record<string, any>> {
    const entity = await this.delegate.findFirst({
      where: {
        id,
        ...this.buildDefaultWhere(user, {
          page: 1,
          limit: 10,
          includeDeleted: true,
        }),
        ...(options?.includeDeleted ? {} : { status: { not: Status.DELETED } }),
        ...(options?.defaultWhere ?? {}),
      },
      include: options?.include,
    });

    if (!entity) {
      throw new NotFoundException(`${this.entityType} topilmadi`);
    }

    return entity;
  }

  async update(
    id: string,
    payload: Record<string, unknown>,
    user: RequestUser,
    request?: Request,
  ): Promise<Record<string, any>> {
    const oldEntity = await this.findScopedEntity(id, user);
    if (!oldEntity) {
      throw new NotFoundException(`${this.entityType} topilmadi`);
    }

    if (oldEntity.status === Status.DELETED) {
      throw new BadRequestException(`${this.entityType} ochirilgan`);
    }

    const safePayload = { ...payload };
    this.ensurePayloadScope(user, safePayload);
    delete safePayload.id;
    delete safePayload.createdAt;
    delete safePayload.updatedAt;
    delete safePayload.deletedAt;

    const updated = await this.delegate.update({
      where: { id },
      data: safePayload,
    });

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.UPDATE,
      entityType: this.entityType,
      entityId: id,
      description: `${this.entityType} yangilandi`,
      oldData: oldEntity,
      newData: updated,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return updated;
  }

  async softDelete(id: string, user: RequestUser, request?: Request) {
    const oldEntity = await this.findScopedEntity(id, user);
    if (!oldEntity) {
      throw new NotFoundException(`${this.entityType} topilmadi`);
    }

    if (oldEntity.status === Status.DELETED) {
      return oldEntity;
    }

    const updated = await this.delegate.update({
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
      entityType: this.entityType,
      entityId: id,
      description: `${this.entityType} soft delete qilindi`,
      oldData: oldEntity,
      newData: updated,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return updated;
  }

  async changeStatus(
    id: string,
    status: Status,
    user: RequestUser,
    request?: Request,
  ): Promise<Record<string, any>> {
    if (status === Status.DELETED) {
      throw new BadRequestException(
        'DELETED uchun delete endpointdan foydalaning',
      );
    }

    const oldEntity = await this.findScopedEntity(id, user);
    if (!oldEntity) {
      throw new NotFoundException(`${this.entityType} topilmadi`);
    }

    const updated = await this.delegate.update({
      where: { id },
      data: { status },
    });

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.UPDATE,
      entityType: this.entityType,
      entityId: id,
      description: `${this.entityType} statusi ${status} qilindi`,
      oldData: oldEntity,
      newData: updated,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return updated;
  }
}

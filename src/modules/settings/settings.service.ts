import { Injectable, NotFoundException } from '@nestjs/common';
import { ActionType } from '@prisma/client';
import type { Request } from 'express';
import { AuditLogService } from '../../common/services/audit-log.service';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { PrismaService } from '../../core/prisma/prisma.service';
import { UpdateOrganizationSettingsDto } from './dto/update-organization-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getOrganization(user: RequestUser) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: user.organizationId },
      include: {
        settings: true,
        branches: {
          where: {
            status: { not: 'DELETED' },
          },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization topilmadi');
    }

    return organization;
  }

  async updateOrganization(
    dto: UpdateOrganizationSettingsDto,
    user: RequestUser,
    request?: Request,
  ) {
    const existing = await this.getOrganization(user);

    const data = await this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.update({
        where: { id: user.organizationId },
        data: {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.code !== undefined ? { code: dto.code } : {}),
          ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
          ...(dto.email !== undefined ? { email: dto.email } : {}),
          ...(dto.website !== undefined ? { website: dto.website } : {}),
          ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl } : {}),
        },
      });

      await tx.organizationSetting.upsert({
        where: { organizationId: user.organizationId },
        update: {
          ...(dto.timezone !== undefined ? { timezone: dto.timezone } : {}),
          ...(dto.locale !== undefined ? { locale: dto.locale } : {}),
          ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
          ...(dto.primaryColor !== undefined
            ? { primaryColor: dto.primaryColor }
            : {}),
        },
        create: {
          organizationId: user.organizationId,
          timezone: dto.timezone ?? 'Asia/Tashkent',
          locale: dto.locale ?? 'uz-UZ',
          currency: dto.currency ?? 'UZS',
          primaryColor: dto.primaryColor ?? null,
        },
      });

      return organization;
    });

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.UPDATE,
      entityType: 'Organization',
      entityId: user.organizationId,
      description: 'Organization sozlamalari yangilandi',
      oldData: existing,
      newData: data,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return this.getOrganization(user);
  }
}

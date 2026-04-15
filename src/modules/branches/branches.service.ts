import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { BaseQueryDto } from '../../common/dto/base-query.dto';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { BaseCrudService } from '../../common/services/base-crud.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { Status } from '@prisma/client';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService extends BaseCrudService {
  protected readonly model = 'branch';
  protected readonly entityType = 'Branch';

  constructor(prisma: PrismaService, auditLogService: AuditLogService) {
    super(prisma, auditLogService);
  }

  async createBranch(
    dto: CreateBranchDto,
    user: RequestUser,
    request?: Request,
  ) {
    return this.create(
      {
        organizationId: user.organizationId,
        name: dto.name,
        code: dto.code,
        phone: dto.phone ?? null,
        email: dto.email ?? null,
        address: dto.address ?? null,
        logoUrl: dto.logoUrl ?? null,
      },
      user,
      request,
    );
  }

  async findBranches(query: BaseQueryDto, user: RequestUser) {
    return this.findAll(query, user, {
      searchFields: ['name', 'code', 'phone', 'email', 'address'],
      defaultWhere: {
        organizationId: user.organizationId,
      },
    });
  }

  async findBranch(id: string, user: RequestUser) {
    return this.findOne(id, user, {
      defaultWhere: {
        organizationId: user.organizationId,
      },
    });
  }

  async updateBranch(
    id: string,
    dto: UpdateBranchDto,
    user: RequestUser,
    request?: Request,
  ) {
    return this.update(id, dto as Record<string, unknown>, user, request);
  }

  async deleteBranch(id: string, user: RequestUser, request?: Request) {
    return this.softDelete(id, user, request);
  }

  async changeBranchStatus(
    id: string,
    status: Status,
    user: RequestUser,
    request?: Request,
  ) {
    return this.changeStatus(id, status, user, request);
  }
}

import { Injectable } from '@nestjs/common';
import { Status } from '@prisma/client';
import type { Request } from 'express';
import { BaseQueryDto } from '../../common/dto/base-query.dto';
import { BaseCrudService } from '../../common/services/base-crud.service';
import { BranchScopeService } from '../../common/services/branch-scope.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import { EntityCheckService } from '../../common/services/entity-check.service';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService extends BaseCrudService {
  protected readonly model = 'course';
  protected readonly entityType = 'Course';

  constructor(
    prisma: PrismaService,
    auditLogService: AuditLogService,
    private readonly branchScopeService: BranchScopeService,
    private readonly entityCheckService: EntityCheckService,
  ) {
    super(prisma, auditLogService);
  }

  async createCourse(
    dto: CreateCourseDto,
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

    return this.create(
      {
        organizationId: user.organizationId,
        branchId,
        name: dto.name,
        code: dto.code ?? null,
        description: dto.description ?? null,
        price: dto.price,
        durationMonth: dto.durationMonth ?? null,
        coverUrl: dto.coverUrl ?? null,
      },
      user,
      request,
    );
  }

  async findCourses(query: BaseQueryDto, user: RequestUser) {
    return this.findAll(query, user, {
      searchFields: ['name', 'code', 'description'],
      defaultWhere: {
        organizationId: user.organizationId,
      },
    });
  }

  async findCourse(id: string, user: RequestUser) {
    return this.findOne(id, user, {
      defaultWhere: {
        organizationId: user.organizationId,
      },
    });
  }

  async updateCourse(
    id: string,
    dto: UpdateCourseDto,
    user: RequestUser,
    request?: Request,
  ) {
    const current = await this.findCourse(id, user);
    const nextBranchId =
      dto.branchId !== undefined
        ? this.branchScopeService.resolveBranchId(user, dto.branchId) ??
          current.branchId
        : current.branchId;
    await this.entityCheckService.ensureBranchExists(
      nextBranchId,
      user.organizationId,
      {
        actor: user,
      },
    );

    const payload = { ...dto } as Record<string, unknown>;
    payload.branchId = nextBranchId;

    return this.update(id, payload, user, request);
  }

  async deleteCourse(id: string, user: RequestUser, request?: Request) {
    return this.softDelete(id, user, request);
  }

  async changeCourseStatus(
    id: string,
    status: Status,
    user: RequestUser,
    request?: Request,
  ) {
    return this.changeStatus(id, status, user, request);
  }
}

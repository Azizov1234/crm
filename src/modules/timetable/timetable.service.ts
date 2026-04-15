import { Injectable } from '@nestjs/common';
import { Status } from '@prisma/client';
import type { Request } from 'express';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { AuditLogService } from '../../common/services/audit-log.service';
import { BaseCrudService } from '../../common/services/base-crud.service';
import { BranchScopeService } from '../../common/services/branch-scope.service';
import { EntityCheckService } from '../../common/services/entity-check.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { TimetableQueryDto } from './dto/timetable-query.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';

@Injectable()
export class TimetableService extends BaseCrudService {
  protected readonly model = 'timetable';
  protected readonly entityType = 'Timetable';

  constructor(
    prisma: PrismaService,
    auditLogService: AuditLogService,
    private readonly branchScopeService: BranchScopeService,
    private readonly entityCheckService: EntityCheckService,
  ) {
    super(prisma, auditLogService);
  }

  async createTimetable(
    dto: CreateTimetableDto,
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
    await this.entityCheckService.ensureGroupExists(dto.groupId, user.organizationId, {
      actor: user,
      expectedBranchId: branchId,
    });
    await this.entityCheckService.ensureRoomExists(dto.roomId, user.organizationId, {
      actor: user,
      expectedBranchId: branchId,
    });

    return this.create(
      {
        organizationId: user.organizationId,
        branchId,
        groupId: dto.groupId,
        roomId: dto.roomId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
        validTo: dto.validTo ? new Date(dto.validTo) : null,
      },
      user,
      request,
    );
  }

  async findTimetables(query: TimetableQueryDto, user: RequestUser) {
    return this.findAll(query, user, {
      include: {
        group: true,
        room: true,
      },
      searchFields: ['group.name', 'room.name'],
      defaultWhere: {
        organizationId: user.organizationId,
        ...(query.groupId ? { groupId: query.groupId } : {}),
        ...(query.roomId ? { roomId: query.roomId } : {}),
        ...(query.dayOfWeek ? { dayOfWeek: query.dayOfWeek } : {}),
      },
      orderBy: {
        dayOfWeek: 'asc',
      },
    });
  }

  async findTimetable(id: string, user: RequestUser) {
    return this.findOne(id, user, {
      include: {
        group: true,
        room: true,
      },
      defaultWhere: {
        organizationId: user.organizationId,
      },
    });
  }

  async updateTimetable(
    id: string,
    dto: UpdateTimetableDto,
    user: RequestUser,
    request?: Request,
  ) {
    const current = await this.findTimetable(id, user);
    const nextBranchId =
      dto.branchId !== undefined
        ? this.branchScopeService.resolveBranchId(user, dto.branchId) ??
          current.branchId
        : current.branchId;

    if (dto.groupId) {
      await this.entityCheckService.ensureGroupExists(
        dto.groupId,
        user.organizationId,
        {
          actor: user,
          expectedBranchId: nextBranchId,
        },
      );
    }

    if (dto.roomId) {
      await this.entityCheckService.ensureRoomExists(dto.roomId, user.organizationId, {
        actor: user,
        expectedBranchId: nextBranchId,
      });
    }

    const payload = {
      ...dto,
      ...(dto.validFrom !== undefined
        ? { validFrom: dto.validFrom ? new Date(dto.validFrom) : null }
        : {}),
      ...(dto.validTo !== undefined
        ? { validTo: dto.validTo ? new Date(dto.validTo) : null }
        : {}),
    } as Record<string, unknown>;

    payload.branchId = nextBranchId;

    return this.update(id, payload, user, request);
  }

  async deleteTimetable(id: string, user: RequestUser, request?: Request) {
    return this.softDelete(id, user, request);
  }

  async findByGroup(groupId: string, user: RequestUser) {
    await this.entityCheckService.ensureGroupExists(groupId, user.organizationId, {
      actor: user,
      allowInactive: true,
    });

    return this.prisma.timetable.findMany({
      where: {
        groupId,
        organizationId: user.organizationId,
        ...(user.role === 'SUPER_ADMIN'
          ? {}
          : user.branchId
            ? { branchId: user.branchId }
            : {}),
        status: { not: Status.DELETED },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findByRoom(roomId: string, user: RequestUser) {
    await this.entityCheckService.ensureRoomExists(roomId, user.organizationId, {
      actor: user,
      allowInactive: true,
    });

    return this.prisma.timetable.findMany({
      where: {
        roomId,
        organizationId: user.organizationId,
        ...(user.role === 'SUPER_ADMIN'
          ? {}
          : user.branchId
            ? { branchId: user.branchId }
            : {}),
        status: { not: Status.DELETED },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async daily(query: TimetableQueryDto, user: RequestUser) {
    const date = query.date ? new Date(query.date) : new Date();
    const dayOfWeek = ((date.getDay() + 6) % 7) + 1;

    return this.prisma.timetable.findMany({
      where: {
        organizationId: user.organizationId,
        ...(user.role === 'SUPER_ADMIN'
          ? query.branchId
            ? { branchId: query.branchId }
            : {}
          : user.branchId
            ? { branchId: user.branchId }
            : {}),
        dayOfWeek,
        status: { not: Status.DELETED },
      },
      include: {
        group: true,
        room: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ActionType, Status, UserRole } from '@prisma/client';
import type { Request } from 'express';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { AuditLogService } from '../../common/services/audit-log.service';
import { BranchScopeService } from '../../common/services/branch-scope.service';
import { EntityCheckService } from '../../common/services/entity-check.service';
import { parsePagination } from '../../common/utils/query.util';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly branchScopeService: BranchScopeService,
    private readonly entityCheckService: EntityCheckService,
    private readonly auditLogService: AuditLogService,
  ) {}

  private normalizeDate(dateString: string) {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private resolveBranch(user: RequestUser, branchId?: string) {
    return this.branchScopeService.ensureBranchForCreate(user, branchId);
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

  private async findScopedAttendance(id: string, user: RequestUser) {
    const attendance = await this.prisma.attendance.findFirst({
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

    if (!attendance) {
      throw new NotFoundException('Attendance topilmadi');
    }

    return attendance;
  }

  async create(dto: CreateAttendanceDto, user: RequestUser, request?: Request) {
    const branchId = this.resolveBranch(user, dto.branchId);
    await this.entityCheckService.ensureBranchExists(branchId, user.organizationId, {
      actor: user,
    });
    await this.entityCheckService.ensureGroupExists(dto.groupId, user.organizationId, {
      actor: user,
      expectedBranchId: branchId,
    });
    await this.entityCheckService.ensureStudentExists(
      dto.studentId,
      user.organizationId,
      {
        actor: user,
        expectedBranchId: branchId,
      },
    );
    await this.ensureStudentInGroup(dto.studentId, dto.groupId);

    const date = this.normalizeDate(dto.date);

    const data = await this.prisma.attendance.upsert({
      where: {
        studentId_groupId_date: {
          studentId: dto.studentId,
          groupId: dto.groupId,
          date,
        },
      },
      create: {
        organizationId: user.organizationId,
        branchId,
        groupId: dto.groupId,
        studentId: dto.studentId,
        date,
        attendanceStatus: dto.attendanceStatus,
        note: dto.note ?? null,
        markedById: user.id,
      },
      update: {
        attendanceStatus: dto.attendanceStatus,
        note: dto.note ?? null,
        markedById: user.id,
      },
    });

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.ATTENDANCE_MARK,
      entityType: 'Attendance',
      entityId: data.id,
      description: 'Davomat belgilandi',
      newData: data,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return data;
  }

  async bulkCreate(
    dto: BulkAttendanceDto,
    user: RequestUser,
    request?: Request,
  ) {
    const results: unknown[] = [];
    for (const record of dto.records) {
      const data = await this.create(record, user, request);
      results.push(data);
    }

    return results;
  }

  async findAll(query: AttendanceQueryDto, user: RequestUser) {
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
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.groupId ? { groupId: query.groupId } : {}),
      ...(query.attendanceStatus
        ? { attendanceStatus: query.attendanceStatus }
        : {}),
      ...(query.date ? { date: this.normalizeDate(query.date) } : {}),
      ...(query.from || query.to
        ? {
            date: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        include: {
          student: { include: { user: true } },
          group: true,
          markedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take,
      }),
      this.prisma.attendance.count({ where }),
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

  async stats(query: AttendanceQueryDto, user: RequestUser) {
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
      ...(query.groupId ? { groupId: query.groupId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.from || query.to
        ? {
            date: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const grouped = await this.prisma.attendance.groupBy({
      by: ['attendanceStatus'],
      where,
      _count: {
        _all: true,
      },
    });

    const total = grouped.reduce((sum, item) => sum + item._count._all, 0);

    return {
      total,
      breakdown: grouped.map((item) => ({
        status: item.attendanceStatus,
        count: item._count._all,
      })),
    };
  }

  async byStudent(
    studentId: string,
    query: AttendanceQueryDto,
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

  async byGroup(groupId: string, query: AttendanceQueryDto, user: RequestUser) {
    await this.entityCheckService.ensureGroupExists(groupId, user.organizationId, {
      actor: user,
      allowInactive: true,
    });
    return this.findAll({ ...query, groupId }, user);
  }

  async update(
    id: string,
    dto: UpdateAttendanceDto,
    user: RequestUser,
    request?: Request,
  ) {
    const existing = await this.findScopedAttendance(id, user);
    const nextBranchId =
      dto.branchId !== undefined
        ? this.branchScopeService.resolveBranchId(user, dto.branchId) ??
          existing.branchId
        : existing.branchId;
    const nextGroupId = dto.groupId ?? existing.groupId;
    const nextStudentId = dto.studentId ?? existing.studentId;

    await this.entityCheckService.ensureGroupExists(
      nextGroupId,
      user.organizationId,
      {
        actor: user,
        expectedBranchId: nextBranchId,
      },
    );
    await this.entityCheckService.ensureStudentExists(
      nextStudentId,
      user.organizationId,
      {
        actor: user,
        expectedBranchId: nextBranchId,
      },
    );
    await this.ensureStudentInGroup(nextStudentId, nextGroupId);

    const payload: Record<string, unknown> = {
      ...(dto.groupId ? { groupId: dto.groupId } : {}),
      ...(dto.studentId ? { studentId: dto.studentId } : {}),
      ...(dto.attendanceStatus
        ? { attendanceStatus: dto.attendanceStatus }
        : {}),
      ...(dto.note !== undefined ? { note: dto.note } : {}),
      ...(dto.date ? { date: this.normalizeDate(dto.date) } : {}),
      branchId: nextBranchId,
      markedById: user.id,
    };

    const data = await this.prisma.attendance.update({
      where: { id },
      data: payload,
    });

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.UPDATE,
      entityType: 'Attendance',
      entityId: id,
      description: 'Davomat yangilandi',
      oldData: existing,
      newData: data,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return data;
  }

  async softDelete(id: string, user: RequestUser, request?: Request) {
    const existing = await this.findScopedAttendance(id, user);

    const data = await this.prisma.attendance.update({
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
      entityType: 'Attendance',
      entityId: id,
      description: 'Davomat ochirildi',
      oldData: existing,
      newData: data,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return data;
  }
}

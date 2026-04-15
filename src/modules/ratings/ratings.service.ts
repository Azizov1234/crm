import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ActionType, Status, UserRole } from '@prisma/client';
import type { Request } from 'express';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { AuditLogService } from '../../common/services/audit-log.service';
import { BranchScopeService } from '../../common/services/branch-scope.service';
import { EntityCheckService } from '../../common/services/entity-check.service';
import { parsePagination } from '../../common/utils/query.util';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingQueryDto } from './dto/rating-query.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly branchScopeService: BranchScopeService,
    private readonly entityCheckService: EntityCheckService,
    private readonly auditLogService: AuditLogService,
  ) {}

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

  private async findScopedRating(id: string, user: RequestUser) {
    const rating = await this.prisma.rating.findFirst({
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

    if (!rating) {
      throw new NotFoundException('Reyting topilmadi');
    }

    return rating;
  }

  async create(dto: CreateRatingDto, user: RequestUser, request?: Request) {
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
    await this.entityCheckService.ensureStudentExists(
      dto.studentId,
      user.organizationId,
      {
        actor: user,
        expectedBranchId: branchId,
      },
    );
    await this.ensureStudentInGroup(dto.studentId, dto.groupId);

    if (dto.teacherId) {
      await this.entityCheckService.ensureTeacherExists(
        dto.teacherId,
        user.organizationId,
        {
          actor: user,
          expectedBranchId: branchId,
        },
      );
    }

    const data = await this.prisma.rating.create({
      data: {
        organizationId: user.organizationId,
        branchId,
        groupId: dto.groupId,
        studentId: dto.studentId,
        teacherId: dto.teacherId ?? null,
        score: dto.score,
        comment: dto.comment ?? null,
        ratedAt: dto.ratedAt ? new Date(dto.ratedAt) : new Date(),
      },
    });

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.CREATE,
      entityType: 'Rating',
      entityId: data.id,
      description: 'Reyting yaratildi',
      newData: data,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return data;
  }

  async findAll(query: RatingQueryDto, user: RequestUser) {
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
      ...(query.teacherId ? { teacherId: query.teacherId } : {}),
      ...(query.from || query.to
        ? {
            ratedAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    if (query.search) {
      where.OR = [
        { comment: { contains: query.search, mode: 'insensitive' } },
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
      this.prisma.rating.findMany({
        where,
        include: {
          student: { include: { user: true } },
          teacher: { include: { user: true } },
          group: true,
        },
        orderBy: { ratedAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.rating.count({ where }),
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

  async top(query: RatingQueryDto, user: RequestUser) {
    const grouped = await this.prisma.rating.groupBy({
      by: ['studentId'],
      where: {
        organizationId: user.organizationId,
        ...(user.role === UserRole.SUPER_ADMIN
          ? query.branchId
            ? { branchId: query.branchId }
            : {}
          : user.branchId
            ? { branchId: user.branchId }
            : {}),
        status: { not: Status.DELETED },
      },
      _avg: {
        score: true,
      },
      _count: {
        _all: true,
      },
      orderBy: {
        _avg: {
          score: 'desc',
        },
      },
      take: 20,
    });

    const studentIds = grouped.map((item) => item.studentId);
    const students = await this.prisma.studentProfile.findMany({
      where: { id: { in: studentIds } },
      include: { user: true },
    });
    const map = new Map(students.map((student) => [student.id, student]));

    return grouped.map((item) => ({
      studentId: item.studentId,
      fullName: map.get(item.studentId)
        ? `${map.get(item.studentId)!.user.firstName} ${map.get(item.studentId)!.user.lastName}`
        : "Nomalum",
      avgScore: Number(item._avg.score ?? 0),
      totalRatings: item._count._all,
    }));
  }

  async byStudent(studentId: string, query: RatingQueryDto, user: RequestUser) {
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

  async update(
    id: string,
    dto: UpdateRatingDto,
    user: RequestUser,
    request?: Request,
  ) {
    const existing = await this.findScopedRating(id, user);
    const nextBranchId =
      dto.branchId !== undefined
        ? this.branchScopeService.resolveBranchId(user, dto.branchId) ??
          existing.branchId
        : existing.branchId;
    const nextGroupId = dto.groupId ?? existing.groupId;
    const nextStudentId = dto.studentId ?? existing.studentId;
    const nextTeacherId =
      dto.teacherId !== undefined ? dto.teacherId : existing.teacherId;

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

    if (nextTeacherId) {
      await this.entityCheckService.ensureTeacherExists(
        nextTeacherId,
        user.organizationId,
        {
          actor: user,
          expectedBranchId: nextBranchId,
        },
      );
    }

    const payload: Record<string, unknown> = {
      ...(dto.groupId ? { groupId: dto.groupId } : {}),
      ...(dto.studentId ? { studentId: dto.studentId } : {}),
      ...(dto.teacherId !== undefined ? { teacherId: dto.teacherId } : {}),
      ...(dto.score !== undefined ? { score: dto.score } : {}),
      ...(dto.comment !== undefined ? { comment: dto.comment } : {}),
      ...(dto.ratedAt !== undefined
        ? { ratedAt: dto.ratedAt ? new Date(dto.ratedAt) : existing.ratedAt }
        : {}),
      branchId: nextBranchId,
    };

    const data = await this.prisma.rating.update({
      where: { id },
      data: payload,
    });

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.UPDATE,
      entityType: 'Rating',
      entityId: id,
      description: 'Reyting yangilandi',
      oldData: existing,
      newData: data,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return data;
  }

  async softDelete(id: string, user: RequestUser, request?: Request) {
    const existing = await this.findScopedRating(id, user);

    const data = await this.prisma.rating.update({
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
      entityType: 'Rating',
      entityId: id,
      description: 'Reyting ochirildi',
      oldData: existing,
      newData: data,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return data;
  }
}

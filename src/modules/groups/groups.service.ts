import { Injectable, NotFoundException } from '@nestjs/common';
import { Status } from '@prisma/client';
import type { Request } from 'express';
import { BaseQueryDto } from '../../common/dto/base-query.dto';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { AuditLogService } from '../../common/services/audit-log.service';
import { BaseCrudService } from '../../common/services/base-crud.service';
import { BranchScopeService } from '../../common/services/branch-scope.service';
import { EntityCheckService } from '../../common/services/entity-check.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AssignGroupStudentsDto } from './dto/assign-group-students.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService extends BaseCrudService {
  protected readonly model = 'group';
  protected readonly entityType = 'Group';

  constructor(
    prisma: PrismaService,
    auditLogService: AuditLogService,
    private readonly branchScopeService: BranchScopeService,
    private readonly entityCheckService: EntityCheckService,
  ) {
    super(prisma, auditLogService);
  }

  async createGroup(dto: CreateGroupDto, user: RequestUser, request?: Request) {
    const branchId = this.branchScopeService.ensureBranchForCreate(
      user,
      dto.branchId,
    );
    await this.entityCheckService.ensureBranchExists(branchId, user.organizationId, {
      actor: user,
    });
    await this.entityCheckService.ensureCourseExists(
      dto.courseId,
      user.organizationId,
      {
        actor: user,
        expectedBranchId: branchId,
      },
    );

    if (dto.roomId) {
      await this.entityCheckService.ensureRoomExists(
        dto.roomId,
        user.organizationId,
        {
          actor: user,
          expectedBranchId: branchId,
        },
      );
    }

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

    if (dto.studentIds?.length) {
      await Promise.all(
        dto.studentIds.map((studentId) =>
          this.entityCheckService.ensureStudentExists(
            studentId,
            user.organizationId,
            {
              actor: user,
              expectedBranchId: branchId,
            },
          ),
        ),
      );
    }

    const group = await this.create(
      {
        organizationId: user.organizationId,
        branchId,
        name: dto.name,
        courseId: dto.courseId,
        roomId: dto.roomId ?? null,
        teacherId: dto.teacherId ?? null,
        code: dto.code ?? null,
        capacity: dto.capacity,
        price: dto.price ?? null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
      user,
      request,
    );

    if (dto.studentIds?.length) {
      await this.prisma.groupStudent.createMany({
        data: dto.studentIds.map((studentId) => ({
          groupId: group.id,
          studentId,
        })),
        skipDuplicates: true,
      });
    }

    return this.findGroup(group.id, user);
  }

  async findGroups(query: BaseQueryDto, user: RequestUser) {
    return this.findAll(query, user, {
      searchFields: ['name', 'code', 'course.name'],
      include: {
        course: true,
        room: true,
        teacher: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
      defaultWhere: {
        organizationId: user.organizationId,
      },
    });
  }

  async findGroup(id: string, user: RequestUser) {
    return this.findOne(id, user, {
      include: {
        course: true,
        room: true,
        teacher: {
          include: {
            user: true,
          },
        },
        students: {
          where: {
            status: { not: Status.DELETED },
          },
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      defaultWhere: {
        organizationId: user.organizationId,
      },
    });
  }

  async updateGroup(
    id: string,
    dto: UpdateGroupDto,
    user: RequestUser,
    request?: Request,
  ) {
    const current = await this.findGroup(id, user);
    const nextBranchId =
      dto.branchId !== undefined
        ? this.branchScopeService.resolveBranchId(user, dto.branchId) ??
          current.branchId
        : current.branchId;

    if (dto.courseId) {
      await this.entityCheckService.ensureCourseExists(
        dto.courseId,
        user.organizationId,
        {
          actor: user,
          expectedBranchId: nextBranchId,
        },
      );
    }

    if (dto.roomId) {
      await this.entityCheckService.ensureRoomExists(
        dto.roomId,
        user.organizationId,
        {
          actor: user,
          expectedBranchId: nextBranchId,
        },
      );
    }

    if (dto.teacherId) {
      await this.entityCheckService.ensureTeacherExists(
        dto.teacherId,
        user.organizationId,
        {
          actor: user,
          expectedBranchId: nextBranchId,
        },
      );
    }

    const payload = { ...dto } as Record<string, unknown>;
    payload.branchId = nextBranchId;

    if (dto.startDate !== undefined) {
      payload.startDate = dto.startDate ? new Date(dto.startDate) : null;
    }

    if (dto.endDate !== undefined) {
      payload.endDate = dto.endDate ? new Date(dto.endDate) : null;
    }

    delete payload.studentIds;

    return this.update(id, payload, user, request);
  }

  async deleteGroup(id: string, user: RequestUser, request?: Request) {
    return this.softDelete(id, user, request);
  }

  async changeGroupStatus(
    id: string,
    status: Status,
    user: RequestUser,
    request?: Request,
  ) {
    return this.changeStatus(id, status, user, request);
  }

  async addStudents(
    id: string,
    dto: AssignGroupStudentsDto,
    user: RequestUser,
    request?: Request,
  ) {
    const group = await this.findGroup(id, user);
    if (!group) {
      throw new NotFoundException('Guruh topilmadi');
    }

    await Promise.all(
      dto.studentIds.map((studentId) =>
        this.entityCheckService.ensureStudentExists(
          studentId,
          user.organizationId,
          {
            actor: user,
            expectedBranchId: group.branchId,
          },
        ),
      ),
    );

    await this.prisma.groupStudent.createMany({
      data: dto.studentIds.map((studentId) => ({ groupId: id, studentId })),
      skipDuplicates: true,
    });

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: 'ASSIGN',
      entityType: 'GroupStudent',
      entityId: id,
      description: 'Guruhga oquvchilar biriktirildi',
      newData: dto,
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return this.findGroup(id, user);
  }

  async updateTeacher(
    id: string,
    teacherId: string,
    user: RequestUser,
    request?: Request,
  ) {
    const group = await this.findGroup(id, user);
    await this.entityCheckService.ensureTeacherExists(
      teacherId,
      user.organizationId,
      {
        actor: user,
        expectedBranchId: group.branchId,
      },
    );

    const data = await this.update(
      id,
      {
        teacherId,
      },
      user,
      request,
    );

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: 'ROLE_UPDATE',
      entityType: 'GroupTeacher',
      entityId: id,
      description: 'Guruh oqituvchisi ozgartirildi',
      newData: { teacherId },
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return data;
  }

  async updateRoom(
    id: string,
    roomId: string,
    user: RequestUser,
    request?: Request,
  ) {
    const group = await this.findGroup(id, user);
    await this.entityCheckService.ensureRoomExists(roomId, user.organizationId, {
      actor: user,
      expectedBranchId: group.branchId,
    });

    return this.update(
      id,
      {
        roomId,
      },
      user,
      request,
    );
  }

  async getTimetable(id: string, user: RequestUser) {
    await this.entityCheckService.ensureGroupExists(id, user.organizationId, {
      actor: user,
      allowInactive: true,
    });

    return this.prisma.timetable.findMany({
      where: {
        groupId: id,
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

  async getRatings(id: string, user: RequestUser) {
    await this.entityCheckService.ensureGroupExists(id, user.organizationId, {
      actor: user,
      allowInactive: true,
    });

    return this.prisma.rating.findMany({
      where: {
        groupId: id,
        organizationId: user.organizationId,
        ...(user.role === 'SUPER_ADMIN'
          ? {}
          : user.branchId
            ? { branchId: user.branchId }
            : {}),
        status: { not: Status.DELETED },
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { ratedAt: 'desc' },
    });
  }
}

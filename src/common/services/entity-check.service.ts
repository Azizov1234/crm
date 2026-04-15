import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Status, UserRole } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { RequestUser } from '../interfaces/request-user.interface';

type ActorScope = Pick<RequestUser, 'role' | 'branchId'>;

type EnsureOptions = {
  actor?: ActorScope;
  includeDeleted?: boolean;
  allowInactive?: boolean;
  expectedBranchId?: string | null;
};

@Injectable()
export class EntityCheckService {
  constructor(private readonly prisma: PrismaService) {}

  private getActorBranchFilter(actor?: ActorScope) {
    if (!actor) {
      return {};
    }

    if (actor.role === UserRole.SUPER_ADMIN) {
      return {};
    }

    if (!actor.branchId) {
      throw new ForbiddenException('Sizga filial biriktirilmagan');
    }

    return { branchId: actor.branchId };
  }

  private assertBranchAccess(
    actor: ActorScope | undefined,
    targetBranchId: string | null | undefined,
  ) {
    if (!actor || actor.role === UserRole.SUPER_ADMIN) {
      return;
    }

    if (!actor.branchId) {
      throw new ForbiddenException('Sizga filial biriktirilmagan');
    }

    if (!targetBranchId || actor.branchId !== targetBranchId) {
      throw new ForbiddenException('Bu filial malumotiga ruxsat yoq');
    }
  }

  private assertEntityStatus(
    entityLabel: string,
    status: Status,
    allowInactive = false,
  ) {
    if (status === Status.DELETED) {
      throw new NotFoundException(`${entityLabel} topilmadi`);
    }

    if (!allowInactive && status !== Status.ACTIVE) {
      throw new BadRequestException(`${entityLabel} faol holatda emas`);
    }
  }

  private assertExpectedBranch(
    entityLabel: string,
    expectedBranchId: string | null | undefined,
    actualBranchId: string | null | undefined,
  ) {
    if (expectedBranchId && actualBranchId !== expectedBranchId) {
      throw new BadRequestException(`${entityLabel} boshqa filialga tegishli`);
    }
  }

  async ensureBranchExists(
    branchId: string,
    organizationId?: string,
    options?: EnsureOptions,
  ) {
    const branch = await this.prisma.branch.findFirst({
      where: {
        id: branchId,
        ...(organizationId ? { organizationId } : {}),
        ...(options?.includeDeleted ? {} : { status: { not: Status.DELETED } }),
      },
    });

    if (!branch) {
      throw new NotFoundException('Filial topilmadi');
    }

    this.assertBranchAccess(options?.actor, branch.id);
    this.assertEntityStatus('Filial', branch.status, options?.allowInactive);

    return branch;
  }

  async ensureUserExists(
    userId: string,
    options?: EnsureOptions & {
      organizationId?: string;
      allowedRoles?: UserRole[];
    },
  ) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        ...(options?.organizationId
          ? { organizationId: options.organizationId }
          : {}),
        ...(options?.includeDeleted ? {} : { status: { not: Status.DELETED } }),
        ...(options?.allowedRoles?.length
          ? { role: { in: options.allowedRoles } }
          : {}),
        ...this.getActorBranchFilter(options?.actor),
      },
    });

    if (!user) {
      throw new NotFoundException('User topilmadi');
    }

    this.assertBranchAccess(options?.actor, user.branchId);
    this.assertEntityStatus('User', user.status, options?.allowInactive);
    this.assertExpectedBranch(
      'User',
      options?.expectedBranchId,
      user.branchId,
    );

    return user;
  }

  async ensureCourseExists(
    courseId: string,
    organizationId: string,
    options?: EnsureOptions,
  ) {
    const course = await this.prisma.course.findFirst({
      where: {
        id: courseId,
        organizationId,
        ...(options?.includeDeleted ? {} : { status: { not: Status.DELETED } }),
        ...this.getActorBranchFilter(options?.actor),
      },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    this.assertBranchAccess(options?.actor, course.branchId);
    this.assertEntityStatus('Kurs', course.status, options?.allowInactive);
    this.assertExpectedBranch(
      'Kurs',
      options?.expectedBranchId,
      course.branchId,
    );

    return course;
  }

  async ensureRoomExists(
    roomId: string,
    organizationId: string,
    options?: EnsureOptions,
  ) {
    const room = await this.prisma.room.findFirst({
      where: {
        id: roomId,
        organizationId,
        ...(options?.includeDeleted ? {} : { status: { not: Status.DELETED } }),
        ...this.getActorBranchFilter(options?.actor),
      },
    });

    if (!room) {
      throw new NotFoundException('Xona topilmadi');
    }

    this.assertBranchAccess(options?.actor, room.branchId);
    this.assertEntityStatus('Xona', room.status, options?.allowInactive);
    this.assertExpectedBranch('Xona', options?.expectedBranchId, room.branchId);

    return room;
  }

  async ensureGroupExists(
    groupId: string,
    organizationId: string,
    options?: EnsureOptions,
  ) {
    const group = await this.prisma.group.findFirst({
      where: {
        id: groupId,
        organizationId,
        ...(options?.includeDeleted ? {} : { status: { not: Status.DELETED } }),
        ...this.getActorBranchFilter(options?.actor),
      },
    });

    if (!group) {
      throw new NotFoundException('Guruh topilmadi');
    }

    this.assertBranchAccess(options?.actor, group.branchId);
    this.assertEntityStatus('Guruh', group.status, options?.allowInactive);
    this.assertExpectedBranch(
      'Guruh',
      options?.expectedBranchId,
      group.branchId,
    );

    return group;
  }

  async ensureTeacherExists(
    teacherId: string,
    organizationId: string,
    options?: EnsureOptions,
  ) {
    const teacher = await this.prisma.teacherProfile.findFirst({
      where: {
        id: teacherId,
        organizationId,
        ...(options?.includeDeleted ? {} : { status: { not: Status.DELETED } }),
        ...this.getActorBranchFilter(options?.actor),
      },
    });

    if (!teacher) {
      throw new NotFoundException('Oqituvchi topilmadi');
    }

    this.assertBranchAccess(options?.actor, teacher.branchId);
    this.assertEntityStatus('Oqituvchi', teacher.status, options?.allowInactive);
    this.assertExpectedBranch(
      'Oqituvchi',
      options?.expectedBranchId,
      teacher.branchId,
    );

    return teacher;
  }

  async ensureStudentExists(
    studentId: string,
    organizationId: string,
    options?: EnsureOptions,
  ) {
    const student = await this.prisma.studentProfile.findFirst({
      where: {
        id: studentId,
        organizationId,
        ...(options?.includeDeleted ? {} : { status: { not: Status.DELETED } }),
        ...this.getActorBranchFilter(options?.actor),
      },
    });

    if (!student) {
      throw new NotFoundException('Oquvchi topilmadi');
    }

    this.assertBranchAccess(options?.actor, student.branchId);
    this.assertEntityStatus('Oquvchi', student.status, options?.allowInactive);
    this.assertExpectedBranch(
      'Oquvchi',
      options?.expectedBranchId,
      student.branchId,
    );

    return student;
  }

  async ensureParentExists(
    parentId: string,
    organizationId: string,
    options?: EnsureOptions,
  ) {
    const parent = await this.prisma.parentProfile.findFirst({
      where: {
        id: parentId,
        organizationId,
        ...(options?.includeDeleted ? {} : { status: { not: Status.DELETED } }),
        ...this.getActorBranchFilter(options?.actor),
      },
    });

    if (!parent) {
      throw new NotFoundException('Ota-ona topilmadi');
    }

    this.assertBranchAccess(options?.actor, parent.branchId);
    this.assertEntityStatus('Ota-ona', parent.status, options?.allowInactive);
    this.assertExpectedBranch(
      'Ota-ona',
      options?.expectedBranchId,
      parent.branchId,
    );

    return parent;
  }

  async ensureStaffExists(
    staffId: string,
    organizationId: string,
    options?: EnsureOptions,
  ) {
    const staff = await this.prisma.staffProfile.findFirst({
      where: {
        id: staffId,
        organizationId,
        ...(options?.includeDeleted ? {} : { status: { not: Status.DELETED } }),
        ...this.getActorBranchFilter(options?.actor),
      },
    });

    if (!staff) {
      throw new NotFoundException('Xodim topilmadi');
    }

    this.assertBranchAccess(options?.actor, staff.branchId);
    this.assertEntityStatus('Xodim', staff.status, options?.allowInactive);
    this.assertExpectedBranch(
      'Xodim',
      options?.expectedBranchId,
      staff.branchId,
    );

    return staff;
  }

  async ensurePaymentExists(
    paymentId: string,
    organizationId: string,
    options?: EnsureOptions,
  ) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id: paymentId,
        organizationId,
        ...(options?.includeDeleted ? {} : { status: { not: Status.DELETED } }),
        ...this.getActorBranchFilter(options?.actor),
      },
    });

    if (!payment) {
      throw new NotFoundException('Tolov topilmadi');
    }

    this.assertBranchAccess(options?.actor, payment.branchId);
    this.assertEntityStatus('Tolov', payment.status, options?.allowInactive);
    this.assertExpectedBranch(
      'Tolov',
      options?.expectedBranchId,
      payment.branchId,
    );

    return payment;
  }

  async ensureTariffPlanExists(
    tariffPlanId: string,
    organizationId: string,
    options?: { includeDeleted?: boolean; allowInactive?: boolean },
  ) {
    const plan = await this.prisma.tariffPlan.findFirst({
      where: {
        id: tariffPlanId,
        organizationId,
        ...(options?.includeDeleted ? {} : { status: { not: Status.DELETED } }),
      },
    });

    if (!plan) {
      throw new NotFoundException('Tariff plan topilmadi');
    }

    this.assertEntityStatus('Tariff plan', plan.status, options?.allowInactive);

    return plan;
  }

  ensureBranchAccess(
    actor: { role: UserRole; branchId: string | null },
    targetBranchId: string | null | undefined,
  ) {
    this.assertBranchAccess(actor, targetBranchId);
  }
}

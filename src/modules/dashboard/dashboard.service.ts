import { Injectable } from '@nestjs/common';
import { Status } from '@prisma/client';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { BranchScopeService } from '../../common/services/branch-scope.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly branchScopeService: BranchScopeService,
  ) {}

  private resolveBranchId(user: RequestUser, query: DashboardQueryDto) {
    return this.branchScopeService.resolveBranchId(user, query.branchId);
  }

  async overview(user: RequestUser, query: DashboardQueryDto) {
    const branchId = this.resolveBranchId(user, query);
    const now = new Date();
    const last30Days = new Date(now);
    last30Days.setDate(last30Days.getDate() - 30);

    const baseWhere = {
      organizationId: user.organizationId,
      ...(branchId ? { branchId } : {}),
      status: { not: Status.DELETED as Status },
    };

    const [
      students,
      groups,
      teachers,
      activeCourses,
      newRegistered,
      incomeAggregate,
    ] = await Promise.all([
      this.prisma.studentProfile.count({ where: baseWhere }),
      this.prisma.group.count({ where: baseWhere }),
      this.prisma.teacherProfile.count({ where: baseWhere }),
      this.prisma.course.count({
        where: { ...baseWhere, status: Status.ACTIVE },
      }),
      this.prisma.user.count({
        where: {
          ...baseWhere,
          role: 'STUDENT',
          createdAt: { gte: last30Days },
        },
      }),
      this.prisma.paymentHistory.aggregate({
        where: {
          organizationId: user.organizationId,
          ...(branchId ? { branchId } : {}),
          status: { not: Status.DELETED },
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      totalStudents: students,
      totalGroups: groups,
      totalTeachers: teachers,
      activeCourses,
      newRegistered,
      income: Number(incomeAggregate._sum.amount ?? 0),
    };
  }

  async genderStats(user: RequestUser, query: DashboardQueryDto) {
    const branchId = this.resolveBranchId(user, query);

    const grouped = await this.prisma.studentProfile.groupBy({
      by: ['gender'],
      where: {
        organizationId: user.organizationId,
        ...(branchId ? { branchId } : {}),
        status: { not: Status.DELETED },
      },
      _count: {
        _all: true,
      },
    });

    return grouped.map((item) => ({
      gender: item.gender,
      count: item._count._all,
    }));
  }

  async monthlyIncome(user: RequestUser, query: DashboardQueryDto) {
    const branchId = this.resolveBranchId(user, query);
    const from = query.from
      ? new Date(query.from)
      : new Date(new Date().getFullYear(), 0, 1);
    const to = query.to ? new Date(query.to) : new Date();

    const rows = await this.prisma.paymentHistory.findMany({
      where: {
        organizationId: user.organizationId,
        ...(branchId ? { branchId } : {}),
        status: { not: Status.DELETED },
        paidAt: {
          gte: from,
          lte: to,
        },
      },
      select: {
        paidAt: true,
        amount: true,
      },
      orderBy: { paidAt: 'asc' },
    });

    const map = new Map<string, number>();
    for (const row of rows) {
      const key = `${row.paidAt.getFullYear()}-${String(row.paidAt.getMonth() + 1).padStart(2, '0')}`;
      const prev = map.get(key) ?? 0;
      map.set(key, prev + Number(row.amount));
    }

    return Array.from(map.entries()).map(([month, amount]) => ({
      month,
      amount,
    }));
  }

  async attendanceStats(user: RequestUser, query: DashboardQueryDto) {
    const branchId = this.resolveBranchId(user, query);

    const grouped = await this.prisma.attendance.groupBy({
      by: ['attendanceStatus'],
      where: {
        organizationId: user.organizationId,
        ...(branchId ? { branchId } : {}),
        status: { not: Status.DELETED },
      },
      _count: {
        _all: true,
      },
    });

    return grouped.map((item) => ({
      status: item.attendanceStatus,
      count: item._count._all,
    }));
  }

  async topStudents(user: RequestUser, query: DashboardQueryDto) {
    const branchId = this.resolveBranchId(user, query);

    const grouped = await this.prisma.rating.groupBy({
      by: ['studentId'],
      where: {
        organizationId: user.organizationId,
        ...(branchId ? { branchId } : {}),
        status: { not: Status.DELETED },
      },
      _avg: { score: true },
      _count: { _all: true },
      orderBy: {
        _avg: {
          score: 'desc',
        },
      },
      take: 10,
    });

    const studentIds = grouped.map((g) => g.studentId);

    const students = await this.prisma.studentProfile.findMany({
      where: {
        id: { in: studentIds },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const studentMap = new Map(
      students.map((student) => [student.id, student]),
    );

    return grouped.map((item) => {
      const student = studentMap.get(item.studentId);

      return {
        studentId: item.studentId,
        fullName: student
          ? `${student.user.firstName} ${student.user.lastName}`
          : 'Noma`lum',
        avgScore: Number(item._avg.score ?? 0),
        ratingCount: item._count._all,
      };
    });
  }
}

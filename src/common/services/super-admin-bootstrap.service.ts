import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Status, UserRole } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { BcryptUtilsService } from '../utils/bcrypt.service';

@Injectable()
export class SuperAdminBootstrapService {
  private readonly logger = new Logger(SuperAdminBootstrapService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly bcryptUtilsService: BcryptUtilsService,
  ) {}

  private isEnabled() {
    const raw = this.configService.get<string>(
      'SUPERADMIN_CREATE_ON_BOOT',
      'true',
    );
    return String(raw).toLowerCase() === 'true';
  }

  private async generateAvailableOrgCode(baseCode: string) {
    let counter = 0;
    let candidate = baseCode;

    while (await this.prisma.organization.findUnique({ where: { code: candidate } })) {
      counter += 1;
      candidate = `${baseCode}_${counter}`;
    }

    return candidate;
  }

  private async ensureOrganization() {
    const configuredCode = (
      this.configService.get<string>('SUPERADMIN_ORGANIZATION_CODE') ??
      'ACADEMY_MAIN'
    )
      .trim()
      .toUpperCase();

    const configuredName =
      this.configService.get<string>('SUPERADMIN_ORGANIZATION_NAME')?.trim() ||
      'Academy Organization';

    const existingByCode = await this.prisma.organization.findUnique({
      where: { code: configuredCode },
    });
    if (existingByCode) {
      return existingByCode;
    }

    const existingOrganization = await this.prisma.organization.findFirst({
      where: { status: { not: Status.DELETED } },
      orderBy: { createdAt: 'asc' },
    });
    if (existingOrganization) {
      return existingOrganization;
    }

    const code = await this.generateAvailableOrgCode(configuredCode);
    return this.prisma.organization.create({
      data: {
        name: configuredName,
        code,
      },
    });
  }

  private async generateAvailableBranchCode(
    organizationId: string,
    baseCode: string,
  ) {
    let counter = 0;
    let candidate = baseCode;

    while (
      await this.prisma.branch.findFirst({
        where: { organizationId, code: candidate },
        select: { id: true },
      })
    ) {
      counter += 1;
      candidate = `${baseCode}_${counter}`;
    }

    return candidate;
  }

  private async ensureDefaultBranch(organizationId: string) {
    const configuredCode = (
      this.configService.get<string>('SUPERADMIN_DEFAULT_BRANCH_CODE') ?? 'MAIN'
    )
      .trim()
      .toUpperCase();
    const configuredName =
      this.configService.get<string>('SUPERADMIN_DEFAULT_BRANCH_NAME')?.trim() ||
      'Main Branch';

    const byCode = await this.prisma.branch.findFirst({
      where: {
        organizationId,
        code: configuredCode,
        status: { not: Status.DELETED },
      },
      select: { id: true },
    });
    if (byCode) {
      return byCode;
    }

    const existing = await this.prisma.branch.findFirst({
      where: {
        organizationId,
        status: { not: Status.DELETED },
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    if (existing) {
      return existing;
    }

    const code = await this.generateAvailableBranchCode(
      organizationId,
      configuredCode,
    );

    const created = await this.prisma.branch.create({
      data: {
        organizationId,
        name: configuredName,
        code,
        status: Status.ACTIVE,
      },
      select: { id: true },
    });

    this.logger.log(`Default branch yaratildi: ${configuredName} (${code})`);
    return created;
  }

  async ensureSuperAdmin() {
    if (!this.isEnabled()) {
      this.logger.log('SUPERADMIN_CREATE_ON_BOOT=false, auto-create ochirildi');
      return;
    }

    const email = this.configService.get<string>('SUPERADMIN_EMAIL')?.trim();
    const phone = this.configService.get<string>('SUPERADMIN_PHONE')?.trim();
    const password = this.configService
      .get<string>('SUPERADMIN_PASSWORD')
      ?.trim();

    if (!password || (!email && !phone)) {
      this.logger.warn(
        'SUPERADMIN_EMAIL yoki SUPERADMIN_PHONE va SUPERADMIN_PASSWORD berilmagan. Seed skip qilindi.',
      );
      return;
    }

    const firstName =
      this.configService.get<string>('SUPERADMIN_FIRST_NAME')?.trim() || 'Super';
    const lastName =
      this.configService.get<string>('SUPERADMIN_LAST_NAME')?.trim() || 'Admin';

    const organization = await this.ensureOrganization();
    await this.ensureDefaultBranch(organization.id);
    const passwordHash = await this.bcryptUtilsService.generateHashPass(password);

    const orFilter: Array<{ email: string } | { phone: string }> = [];
    if (email) orFilter.push({ email });
    if (phone) orFilter.push({ phone });

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: orFilter },
    });

    if (existingUser) {
      const updated = await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          organizationId: existingUser.organizationId || organization.id,
          branchId: null,
          role: UserRole.SUPER_ADMIN,
          firstName,
          lastName,
          email: existingUser.email ?? email ?? null,
          phone: existingUser.phone ?? phone ?? null,
          passwordHash,
          status: Status.ACTIVE,
          deletedAt: null,
        },
      });

      this.logger.log(
        `Superadmin yangilandi: ${updated.email ?? updated.phone ?? updated.id}`,
      );
      return;
    }

    const created = await this.prisma.user.create({
      data: {
        organizationId: organization.id,
        branchId: null,
        role: UserRole.SUPER_ADMIN,
        firstName,
        lastName,
        email: email ?? null,
        phone: phone ?? null,
        passwordHash,
        status: Status.ACTIVE,
      },
    });

    this.logger.log(
      `Superadmin yaratildi: ${created.email ?? created.phone ?? created.id}`,
    );
  }
}

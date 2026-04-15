import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ActionType, Status } from '@prisma/client';
import type { Request } from 'express';
import { BcryptUtilsService } from '../../common/utils/bcrypt.service';
import { IJwtPayload, JwtUtilsService } from '../../common/utils/jwt.service';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { AuditLogService } from '../../common/services/audit-log.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bcryptUtilsService: BcryptUtilsService,
    private readonly jwtUtilsService: JwtUtilsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async login(dto: LoginDto, request?: Request) {
    const identifier = dto.identifier.trim();

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Login yoki parol notogri');
    }

    if (user.status !== Status.ACTIVE) {
      throw new BadRequestException('Foydalanuvchi faol emas');
    }

    const validPassword = await this.bcryptUtilsService.comparePasswords(
      dto.password,
      user.passwordHash,
    );

    if (!validPassword) {
      throw new UnauthorizedException('Login yoki parol notogri');
    }

    const payload: IJwtPayload = {
      sub: user.id,
      organizationId: user.organizationId,
      branchId: user.branchId,
      role: user.role,
    };

    const accessToken = this.jwtUtilsService.generateToken(payload);

    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.LOGIN,
      entityType: 'Auth',
      entityId: user.id,
      description: 'Foydalanuvchi tizimga kirdi',
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        branchId: user.branchId,
        organizationId: user.organizationId,
      },
    };
  }

  async logout(user: RequestUser, request?: Request) {
    await this.auditLogService.logAction({
      organizationId: user.organizationId,
      userId: user.id,
      branchId: user.branchId,
      actionType: ActionType.LOGOUT,
      entityType: 'Auth',
      entityId: user.id,
      description: 'Foydalanuvchi tizimdan chiqdi',
      ipAddress: request?.ip,
      userAgent: request?.headers['user-agent'] ?? null,
    });

    return { success: true };
  }

  async me(user: RequestUser) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        organizationId: true,
        branchId: true,
        status: true,
        avatarUrl: true,
      },
    });

    if (!dbUser) {
      throw new UnauthorizedException('User topilmadi');
    }

    return dbUser;
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';

export interface IJwtPayload {
  sub: string;
  organizationId: string;
  branchId?: string | null;
  role: UserRole;
}

@Injectable()
export class JwtUtilsService {
  constructor(private readonly jwt: JwtService) {}

  generateToken(payload: IJwtPayload): string {
    return this.jwt.sign(payload);
  }

  verifyToken(token: string): IJwtPayload {
    try {
      return this.jwt.verify<IJwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Yaroqsiz yoki muddati tugagan token');
    }
  }
}

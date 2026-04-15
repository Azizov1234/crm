import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

@Injectable()
export class BranchAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as {
      role?: UserRole;
      branchId?: string | null;
    };

    if (!user) {
      throw new UnauthorizedException('User topilmadi');
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    const branchIdFromRequest =
      request.params?.branchId ??
      request.body?.branchId ??
      request.query?.branchId;

    if (!branchIdFromRequest) {
      return true;
    }

    if (!user.branchId) {
      throw new ForbiddenException('Sizga filial biriktirilmagan');
    }

    if (branchIdFromRequest !== user.branchId) {
      throw new ForbiddenException(
        'Faqat oz filialingiz bilan ishlashingiz mumkin',
      );
    }

    return true;
  }
}

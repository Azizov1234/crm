import { Global, Module } from '@nestjs/common';
import { AuditLogService } from '../../common/services/audit-log.service';
import { BranchScopeService } from '../../common/services/branch-scope.service';
import { EntityCheckService } from '../../common/services/entity-check.service';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [
    PrismaService,
    AuditLogService,
    BranchScopeService,
    EntityCheckService,
  ],
  exports: [
    PrismaService,
    AuditLogService,
    BranchScopeService,
    EntityCheckService,
  ],
})
export class PrismaModule {}

import { Status, UserRole } from '@prisma/client';
import { BaseQueryDto } from '../dto/base-query.dto';

export function parsePagination(query: BaseQueryDto) {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

function buildContainsFilter(
  searchPath: string,
  search: string,
): Record<string, unknown> {
  const parts = searchPath.split('.');
  const leaf: Record<string, unknown> = {
    contains: search,
    mode: 'insensitive',
  };

  return parts.reverse().reduce((acc, key) => ({ [key]: acc }), leaf);
}

export function buildListWhere(
  query: BaseQueryDto,
  options?: {
    defaultWhere?: Record<string, unknown>;
    searchFields?: string[];
    createdAtField?: string;
  },
) {
  const where: Record<string, unknown> = {
    ...(options?.defaultWhere ?? {}),
  };

  if (query.status) {
    where.status = query.status;
  } else if (!query.includeDeleted && where.status === undefined) {
    where.status = { not: Status.DELETED };
  }

  if (query.branchId && where.branchId === undefined) {
    where.branchId = query.branchId;
  }

  const createdAtField = options?.createdAtField ?? 'createdAt';
  if (query.from || query.to) {
    where[createdAtField] = {
      ...(query.from ? { gte: new Date(query.from) } : {}),
      ...(query.to ? { lte: new Date(query.to) } : {}),
    };
  }

  if (query.search && options?.searchFields?.length) {
    where.OR = options.searchFields.map((field) =>
      buildContainsFilter(field, query.search!),
    );
  }

  return where;
}

export function enforceBranchScope(
  user: { role: UserRole; branchId: string | null },
  requestedBranchId?: string,
): string | undefined {
  if (user.role === UserRole.SUPER_ADMIN) {
    return requestedBranchId;
  }

  if (!user.branchId) {
    throw new Error('Sizga filial biriktirilmagan');
  }

  if (requestedBranchId && requestedBranchId !== user.branchId) {
    throw new Error('Faqat ozingizning filialingizga ruxsat bor');
  }

  return user.branchId;
}

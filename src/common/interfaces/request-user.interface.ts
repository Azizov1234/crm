import { Status, UserRole } from '@prisma/client';

export interface RequestUser {
  id: string;
  organizationId: string;
  branchId: string | null;
  role: UserRole;
  status: Status;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
}

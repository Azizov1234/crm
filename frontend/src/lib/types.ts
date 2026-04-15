export type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "TEACHER"
  | "STUDENT"
  | "PARENT"
  | "STAFF";

export type Status = "ACTIVE" | "INACTIVE" | "ARCHIVED" | "DELETED";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  role: Role;
  status?: Status;
  isActive: boolean;
  branchId?: string | null;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  studentNo?: string | null;
  status: Status;
  isActive: boolean;
  createdAt: string;
}

export interface Teacher {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  specialty?: string | null;
  salary?: number | null;
  status: Status;
  isActive: boolean;
  createdAt: string;
}

export interface CourseOption {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  code?: string | null;
  capacity: number;
  price?: number | null;
  status: Status;
  isActive: boolean;
  createdAt: string;
  course?: {
    id: string;
    name: string;
  } | null;
  teacher?: {
    id: string;
    fullName: string;
  } | null;
}

export interface Attendance {
  id: string;
  date: string;
  attendanceStatus: AttendanceStatus;
  note?: string | null;
  status: Status;
  student?: {
    id: string;
    fullName: string;
  } | null;
  group?: {
    id: string;
    name: string;
  } | null;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  groupId?: string | null;
  groupName?: string | null;
  amount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  month: number;
  year: number;
  createdAt: string;
  status: Status;
}

export interface DashboardOverview {
  totalStudents: number;
  totalGroups: number;
  totalTeachers: number;
  activeCourses: number;
  newRegistered: number;
  income: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiPaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

export interface AuthSession {
  accessToken: string;
  user: User;
}

export interface ApiErrorShape {
  success?: boolean;
  statusCode?: number;
  code?: string;
  message?: string | string[];
  details?: string[];
}

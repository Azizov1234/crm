import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './core/prisma/prisma.module';
import { SecurityModule } from './common/utils/security.module';
import { UploadsModule } from './common/uploads/uploads.module';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { UsersModule } from './modules/users/users.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { StudentsModule } from './modules/students/students.module';
import { ParentsModule } from './modules/parents/parents.module';
import { AdminsModule } from './modules/admins/admins.module';
import { GroupsModule } from './modules/groups/groups.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { CoursesModule } from './modules/courses/courses.module';
import { TimetableModule } from './modules/timetable/timetable.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { StaffAttendanceModule } from './modules/staff-attendance/staff-attendance.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SettingsModule } from './modules/settings/settings.module';
import { BranchesModule } from './modules/branches/branches.module';
import { TariffsModule } from './modules/tariffs/tariffs.module';
import { SmsModule } from './modules/sms/sms.module';
import { FinanceModule } from './modules/finance/finance.module';
import { ActionLogsModule } from './modules/action-logs/action-logs.module';
import { ErrorLogsModule } from './modules/error-logs/error-logs.module';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';
import { SuperAdminBootstrapService } from './common/services/super-admin-bootstrap.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    PrismaModule,
    SecurityModule,
    UploadsModule,
    AuthModule,
    DashboardModule,
    UsersModule,
    TeachersModule,
    StudentsModule,
    ParentsModule,
    AdminsModule,
    GroupsModule,
    RoomsModule,
    CoursesModule,
    TimetableModule,
    AttendanceModule,
    StaffAttendanceModule,
    RatingsModule,
    PaymentsModule,
    SettingsModule,
    BranchesModule,
    TariffsModule,
    SmsModule,
    FinanceModule,
    ActionLogsModule,
    ErrorLogsModule,
  ],
  providers: [GlobalExceptionFilter, SuperAdminBootstrapService],
})
export class AppModule {}

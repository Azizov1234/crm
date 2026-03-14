import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./core/database/prisma.module";
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { EmailModule } from "./common/email/email.module";
import { RoomsModule } from './modules/rooms/rooms.module';
import { CoursesModule } from './modules/courses/courses.module';
import { GroupsModule } from './modules/groups/groups.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { HomeworkModule } from './modules/homework/homework.module';



@Module({
  imports: [ConfigModule.forRoot({
    isGlobal:true
  }),ServeStaticModule.forRoot({
    rootPath:join(process.cwd(),"src","uploads"),
    serveRoot:"/files"
  }),PrismaModule, AuthModule, UsersModule, StudentsModule, TeachersModule,EmailModule, RoomsModule, CoursesModule, GroupsModule, LessonsModule, AttendanceModule, HomeworkModule],


})
export class AppModule {}

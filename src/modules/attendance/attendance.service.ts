import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) { }
  async createAttendance(payload: CreateAttendanceDto, currentUser: { id: number, role: string }) {
    const lessonGroup = await this.prisma.lesson.findFirst({
      where: {
        id: payload.lesson_id
      },
      select: {
        created_at:true,
        groups: {
          select: {
            id: true,
            teacher_id:true,
            start_time: true,
            start_date: true,
            week_day: true,
            courses: {
              select: {
                duration_hours: true
              }
            }
          }
        }
      }
    })
    if (!lessonGroup) {
      throw new NotFoundException("Lesson topilmadi")
    }
    const existStudent = await this.prisma.studentGroup.findFirst({
      where: {
        student_id: payload.student_id,
        group_id: lessonGroup?.groups.id,
        status:"active"
      }
    })
    if (!existStudent) throw new NotFoundException("Student is not found in a group")
    if(lessonGroup.groups.teacher_id!==currentUser.id && currentUser.role==="TEACHER"){
      throw new ForbiddenException("Sizda bu guruhga ruxsat yo'q")
    }
    const timeToMinutes = (time: string) => {
      const [h, m] = time.split(":").map(Number)
      return h * 60 + m
    }
    const week = {
      1: "MONDAY",
      2: "TUESDAY",
      3: "WEDNESDAY",
      4: "THURSDAY",
      5: "FRIDAY",
      6: "SATURDAY",
      7: "SUNDAY"
    }

    const week_day = lessonGroup?.groups.week_day as string[]
    const nowDate = new Date()
    const day = nowDate.getDay()
    if (!week_day?.includes(week[day])) {
      throw new BadRequestException("Dars  vaqti bugun  emas")
    }
    const startMinute = timeToMinutes(lessonGroup!.groups.start_time)
    const endMinute = startMinute + lessonGroup!.groups.courses.duration_hours * 60

    const nowMinute = nowDate.getHours() * 60 + nowDate.getMinutes()

    if(lessonGroup.created_at.getTime()<Date.now()){
      throw new ForbiddenException("Eski davomtni qila olmaysiz")
    }
    if (startMinute > nowMinute) {
      throw new BadRequestException("Dars boshlanmadi")
    }
    if (!(startMinute < nowMinute && endMinute > nowMinute) && currentUser.role === Role.TEACHER) {
      throw new BadRequestException("Dars vaqtidan tashqarida davomat bo'lmaydi")
    }
     

    const data = await this.prisma.attendance.create({
      data: {

        ...payload,
        teacher_id: currentUser.role === "TEACHER" ? currentUser.id : null,
        user_id: currentUser.role !== "TEACHER" ? currentUser.id : null,

      }
    })
    return {
      success: true,
      message: "Attendance succesfully created"
    }
  }

  async findAllAttendance() {
    const data= await this.prisma.attendance.findMany()
    return {
      success:true,
      message:"All attendance ",
      data
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} attendance`;
  }

  update(id: number, updateAttendanceDto: UpdateAttendanceDto) {
    return `This action updates a #${id} attendance`;
  }

  remove(id: number) {
    return `This action removes a #${id} attendance`;
  }
}

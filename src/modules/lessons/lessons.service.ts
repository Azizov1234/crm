import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { Role, Status } from '@prisma/client';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) { }
  async createLesson(payload: CreateLessonDto, currentUser: { id: number, role: Role }) {
    const existGroup = await this.prisma.group.findUnique({
      where: {
        id: payload.group_id,
        status: Status.active
      }
    })
    if (!existGroup) throw new NotFoundException("Group is not found with this id")
    const existName = await this.prisma.lesson.findUnique({
      where: {
        topic: payload.topic
      }
    })
    if (existName) throw new ConflictException("Topic is already used")
    if (currentUser.role === "TEACHER" && existGroup.teacher_id !== currentUser.id) {
      throw new ForbiddenException("Group is not to your")
    }
    const data = await this.prisma.lesson.create({
      data: {
        ...payload,
        teacher_id: currentUser.role === "TEACHER" ? currentUser.id : null,
        user_id: currentUser.role !== "TEACHER" ? currentUser.id : null
      }
    })
    return {
      sucess: true,
      message: "Lesson succesfully created"
    }
  }

  async findAllLessons() {
    const data = await this.prisma.lesson.findMany({
      where: { status: "active" }
    })
    return {
      success: true,
      message: "All lessons",
      data
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} lesson`;
  }

  update(id: number, updateLessonDto: UpdateLessonDto) {
    return `This action updates a #${id} lesson`;
  }

  remove(id: number) {
    return `This action removes a #${id} lesson`;
  }
}

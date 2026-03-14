import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create.course.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { UpdateCourseDto } from './dto/update.course.dto';

@Injectable()
export class CoursesService {
    constructor(private readonly prisma: PrismaService) {}
    async createCourse(payload: CreateCourseDto) {

        const existCourse = await this.prisma.course.findUnique({
            where: {
                name: payload.name
            }
        })
        if (existCourse) throw new ConflictException("Name is already used")

        await this.prisma.course.create({ data: payload })
        return {
            success: true,
            message: "Course is successfully created !"
        }
    }
    async getOneCourse(courseId:number){
        const existCourse= await this.prisma.course.findUnique({
            where:{
                id:courseId
            }
        })
        if(!existCourse){
            throw new NotFoundException("Course is not found with this id")
        }
        const data= await  this.prisma.course.findUnique({
            where:{
                id:courseId,
                status:"active"
            },select:{
                id:true,
                name:true,
                price:true,
                duration_month:true,
                duration_hours:true,
                level:true,
                description:true,
                created_at:true,

                groups:{
                    select:{
                        id:true,
                        name:true
                    }
                }
            }
        })
        return{
            success:true,
            data
        }
    }
      
    async getALlCourses(){
            return {
                success:true,
                data: await this.prisma.course.findMany({
                    where:{
                        status:"active"
                    }
                })
            }
    }
    async getALlInActivesCourses(){
            return {
                success:true,
                data: await this.prisma.course.findMany({
                    where:{
                        status:"inactive"
                    }
                })
            }
    }
    async deleteCourse(courseId:number){
            const existCourse= await this.prisma.room.findUnique({
                where:{
                    id:courseId
                }
            })
            if(!existCourse) throw new NotFoundException("Room is not found with this id")
            
            await this.prisma.course.update({
                where:{
                    id:courseId
                },
                data:{
                    status:"inactive"
                }
            })
    
            return{
                success:true,
                message:"Course is successfully deleted"
            }
    }
    async updateCourse(payload:UpdateCourseDto,courseId:number){
            const existCourse= await this.prisma.course.findUnique({
                where:{
                    id:courseId
                }
            })
            if(!existCourse) throw new NotFoundException("Course is not found with this id")
            
            await this.prisma.course.update({
                where:{
                    id:courseId
                },
                data:{
                    ...payload
                }
            })
            return {
                success:true,
                message:"]Course successfully updated"
            }
    }

}

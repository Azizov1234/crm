import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreatStudentGroupDto } from './dto/create.student.group.dto';

@Injectable()
export class StudentGroupService {
    constructor(private readonly prisma:PrismaService){}

    async createStudentGroups(payload:CreatStudentGroupDto){
        const existStudent= await this.prisma.student.findUnique({
            where:{
                id:payload.student_id,
                status:"active"
            }
        })
        if(!existStudent) throw new NotFoundException("Students is not found with this id")
        const existGroup= await this.prisma.group.findUnique({
            where:{
                
                id:payload.group_id,
                
                status:"active"
            }
        })
        if(!existGroup) throw new NotFoundException("Group is not found with this id")
        
        const existGroupsCount= await this.prisma.studentGroup.count({where:{
            group_id:payload.group_id
        }})
        if(existGroupsCount>=existGroup.max_student) throw new BadRequestException("Group is already completed")
        const existData= await this.prisma.studentGroup.findFirst({
            where:{
                group_id:payload.group_id,
                student_id:payload.student_id
            }
        })
        if(existData) throw new ConflictException("Student is already  created with this group id")
        const data= await this.prisma.studentGroup.create({data:payload})

        return{
            success:true,
            message:"Student group successfully created"
        }
    }
    async getAllStudentsGroups(){
        const data= await this.prisma.studentGroup.findMany({
            where:{
                status:"active"
            }
        })
        return{
            success:true,
            data
        }
    }
    async getOneStudentGroups( id:number){
        const existStudentGroups= await this.prisma.studentGroup.findMany({
            where:{
                id
            }
        })
        if(!existStudentGroups) throw new NotFoundException("Student groups is not found with thi id")

        return{
            success:true,
            data:existStudentGroups
        }
    }
}

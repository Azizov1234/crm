import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';

import * as bcrypt from "bcrypt"
import { Status } from '@prisma/client';
import { TeacherCreateDto } from './dto/TeacherCreateDto';
import { UpdateTeacherDto } from './dto/UpdateTeacherDto';

@Injectable()
export class TeachersService {
    constructor(private readonly prisma:PrismaService){}

    async createTeacher(payload:TeacherCreateDto,photo?:string){
        const existEmail= await this.prisma.teacher.findUnique({where:{
            email:payload.email
        }})

        if(existEmail) throw new ConflictException("Email is already used")
        
        const existPhone= await this.prisma.student.findUnique({
            where:{
                phone:payload.phone
            }
        })
        if(existPhone) throw new ConflictException("Phone number already used")
        
        const hashPass= await bcrypt.hash(payload.password,10)

        const data= await this.prisma.teacher.create({
            data:{
                first_name:payload.first_name,
                last_name:payload.last_name,
                phone:payload.phone,
                photo:photo,
                email:payload.email,
                password:hashPass,
                address:payload.address,
        }})
        return{
            success:true,
            message:"Teacher is created"
        }
        

    }
    async getAllTeachers(){
        const data= await this.prisma.teacher.findMany({
            where:{status:Status.active},
            select:{
            id:true,
            first_name:true,
            last_name:true,
            phone:true,
            email:true,
            address:true,
            photo:true

        }})
        return{
            success:true,
            message:"All Teachers",
            data
        }
    }
    async getAllInActiveTeachers(){
        const data= await this.prisma.teacher.findMany({
            where:{status:Status.inactive},
            select:{
            id:true,
            first_name:true,
            last_name:true,
            phone:true,
            email:true,
            address:true,
            photo:true

        }})
        return{
            success:true,
            message:"All InActive Teachers",
            data
        }
    }
    async deleteTeacher(id:number){
        const existStudent= await this.prisma.teacher.findUnique({where:{id}})
        if(!existStudent) throw new NotFoundException("Teacher is not found with this id")
        const delStudent= await this.prisma.teacher.update({
            where:{
                id:id
            },
            data:{
                status:Status.inactive
            }
        })
        

        return{
            success:true,
            message:"Students succesfully deleted !"
        }
    }
    async updateTeacher(id:number,payload:UpdateTeacherDto,photoName?:string){
        const updateData= {...payload}

        if(photoName) updateData.photo=photoName

        const data= await this.prisma.teacher.update({
            where:{id},
            data:updateData
        })
        return{
            success:true,
            message:"Teacher succesfully updated"
        }
    }
    async getOneTeacherGroups(id:number){
         const existStudent= await this.prisma.teacher.findUnique({where:{id}})
        if(!existStudent) throw new NotFoundException("Teacher is not found with thi id")
        // const data= await this.prisma
    }
       
}

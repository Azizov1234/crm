import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { StudentCreateDto } from './dto/StudentCreateDto';
import * as bcrypt from "bcrypt"
import { Status } from '@prisma/client';
import { UpdateStudentDto } from './dto/UpdateStudentDto';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailService } from 'src/common/email/email.service';
@Injectable()
export class StudentsService {
    constructor(private readonly prisma:PrismaService,private readonly emailService:EmailService ){}

    async createStudent(payload:StudentCreateDto,photo?:string){
        const existEmail= await this.prisma.student.findUnique({where:{
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

        const data= await this.prisma.student.create({
            data:{
                first_name:payload.first_name,
                last_name:payload.last_name,
                phone:payload.phone,
                photo:photo,
                email:payload.email,
                password:hashPass,
                address:payload.address,
                birth_date:new Date(payload.birth_date)
        }})
        await this.emailService.sendEmail(payload.email,payload.phone,payload.password)
        return{
            success:true,
            message:"Student is created and login and password sended !"
        }
        

    }
    async getAllStudents(){
        const data= await this.prisma.student.findMany({
            where:{status:Status.active},
            select:{
            id:true,
            first_name:true,
            last_name:true,
            phone:true,
            email:true,
            address:true,
            birth_date:true,
            photo:true

        }})
        return{
            success:true,
            message:"All Students",
            data
        }
    }
    async getAllInActiveStudents(){
        const data= await this.prisma.student.findMany({
            where:{status:Status.inactive},
            select:{
            id:true,
            first_name:true,
            last_name:true,
            phone:true,
            email:true,
            address:true,
            birth_date:true,
            photo:true

        }})
        return{
            success:true,
            message:"All Students inactive",
            data
        }
    }

    async deleteStudent(id:number){
        const existStudent= await this.prisma.student.findUnique({where:{id}})
        if(!existStudent) throw new NotFoundException("Student is not found with this id")
        const delStudent= await this.prisma.student.update({
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
    async updateStudent(id:number,payload:UpdateStudentDto,photoName?:string){
        const updateData= {...payload}

        if(photoName) updateData.photo=photoName

        const data= await this.prisma.student.update({
            where:{id},
            data:updateData
        })
        return{
            success:true,
            message:"Student succesfully updated"
        }
    }
    async getOneStudentGroups(id:number){
  
    }

}

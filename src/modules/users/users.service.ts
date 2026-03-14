import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create.admin.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt'
import { Role, Status } from '@prisma/client';
import { EmailService } from 'src/common/email/email.service';
@Injectable()
export class UsersService {
    constructor(private readonly prisma:PrismaService,private readonly jwt:JwtService,private readonly emailService:EmailService){}
    async createAdmin(payload:CreateUserDto){
        const existUserEmail= await this.prisma.users.findUnique({where:{
            email:payload.email
        }})
        if(existUserEmail) throw new ConflictException("Email is already used")
        const existUserPhone= await this.prisma.users.findUnique({where:{
            phone:payload.phone
        }})
        if(existUserPhone) throw new ConflictException("Phone number is already existed")
        const hashPass= await bcrypt.hash(payload.password,10)
        const data= await this.prisma.users.create({data:{
            email:payload.email,
            phone:payload.phone,
            first_name:payload.fist_name,
            last_name:payload.last_name,
            photo:"jhbbhbhdk",
            password:hashPass,
            address:payload.address,
            role:"ADMIN"
        }})
        this.emailService.sendEmail(payload.email,payload.phone,payload.password)
        return {
            success:true,
            message:"Admin succesfully created",
            accessToken: this.jwt.sign({id:data.id,email:data.email,role:data.role,phone:data.phone})
        }
    }
    async getAllAdmins(){
        const data= await this.prisma.users.findMany({
            where:{status:Status.active},
            select:{
            id:true,
            first_name:true,
            last_name:true,
            email:true,
            phone:true,
            photo:true,
            address:true,
            status:true,
            role:true

        }})
        return{
            success:true,
            message:"All admins !",
            data
        }
    }
}

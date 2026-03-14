import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from "bcrypt"
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(private readonly prisma:PrismaService,private readonly jwt:JwtService){}
    async loginUsers(payload:LoginDto){
        const existUser= await this.prisma.users.findUnique({
            where:{
                phone:payload.phone
            }
        }) 
        if(!existUser) throw new UnauthorizedException("Invalid phone or password")
        const isMatch = await bcrypt.compare(payload.password,existUser.password)
        if(!isMatch) throw new UnauthorizedException("Invalid phone or password")
        return {
            success:true,
            message:"Your logged",
            accesToken:this.jwt.sign({id:existUser.id,email:existUser.email,phone:existUser.phone,role:existUser.role})
        }
    }

    async loginTeachers(payload:LoginDto){
         const existUser= await this.prisma.teacher.findUnique({
            where:{
                phone:payload.phone
            }
        }) 
        if(!existUser) throw new UnauthorizedException("Invalid phone or password")
        const isMatch = await bcrypt.compare(payload.password,existUser.password)
        if(!isMatch) throw new UnauthorizedException("Invalid phone or password")
        return {
            success:true,
            message:"Your logged",
            accesToken:this.jwt.sign({id:existUser.id,email:existUser.email,phone:existUser.phone,role:Role.TEACHER})
        }
    }

    async loginStudents(payload:LoginDto){
        const existUser= await this.prisma.student.findUnique({
            where:{
                phone:payload.phone
            }
        }) 
        if(!existUser) throw new UnauthorizedException("Invalid phone or password")
        const isMatch = await bcrypt.compare(payload.password,existUser.password)
        if(!isMatch) throw new UnauthorizedException("Invalid phone or password")
        return {
            success:true,
            message:"Your logged",
            accesToken:this.jwt.sign({id:existUser.id,email:existUser.email,phone:existUser.phone,role:Role.STUDENT})
        }
    }
}

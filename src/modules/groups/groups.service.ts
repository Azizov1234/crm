import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateGroupDto } from './dto/create.dto.groups';
import { FilterQuerysDto } from './dto/FilterQuerysDto';
import { Status } from '@prisma/client';
import { UpdateGroupDto } from './dto/update.dto';

@Injectable()
export class GroupsService {

    constructor(private readonly prisma:PrismaService){}

    async createGroup(payload:CreateGroupDto){
        const existName= await this.prisma.group.findUnique({
            where:{
                name:payload.name
            }
        })
        
        if(existName) throw new ConflictException("Group name is already used")

        const existCourse= await this.prisma.course.findUnique({
            where:{
                id:payload.course_id
            }

        })
       
        
        if(!existCourse) throw new NotFoundException("Course is not found with this id" )
        const existTeacher= await this.prisma.teacher.findUnique({
            where:{
                id:payload.teacher_id
            }
        })
        if(!existTeacher) throw new NotFoundException("Teacher is not found with this id")
        const existRoom=await this.prisma.room.findUnique({
            where:{
                id:payload.room_id
            }
        })
        if(!existRoom) throw new NotFoundException("Room is not found with this id")
        const existRoomGroups= await this.prisma.group.findMany({
            where:{
                room_id:payload.room_id
            },
            select:{
                start_time:true,
                week_day:true,
                courses:{
                    select:{
                        duration_hours:true
                    }
                }
            }
        })
        const existRoomCourse= await this.prisma.course.findMany({
            where:{
                id:payload.course_id
            }
        })
        
        
        let start_minut_newGroup= Number(payload.start_time.split(":")[0])*60+Number(payload.start_time.split(':')[1])
        let end_minut_newGroup= Number(payload.start_time.split(":")[0])*60+Number(payload.start_time.split(':')[1])+Number(existRoomCourse[0].duration_hours)*60
        let newGroupWeekDays=payload.week_day
        const busyRooms=existRoomGroups.map(el=>{
            let oldGroupWeekDays = el.week_day 
        
            let chechDays= oldGroupWeekDays.filter(day=>newGroupWeekDays.includes(day))
            if(chechDays.length===0) return
            let start_minut= Number(el.start_time.split(":")[0])*60+Number(el.start_time.split(':')[1])
            let end_minut= Number(el.start_time.split(":")[0])*60+Number(el.start_time.split(':')[1])+Number(el.courses.duration_hours*60)
            
            if(start_minut_newGroup < end_minut && end_minut_newGroup > start_minut){
                throw new ConflictException(
                    `Sorry, this room is already occupied on day(s) [${chechDays.join(', ')}] from ${el.start_time} to ${end_minut}`
                )
            }

        })
       
        
        
        const data = await this.prisma.group.create({ data: {
            name:payload.name,
            description:payload.description,
            course_id:payload.course_id,
            teacher_id:payload.teacher_id,
            room_id:payload.room_id,
            start_date: new Date(payload.start_date),
            start_time: payload.start_time,
            week_day:payload.week_day,
            max_student:payload.max_student
            
        }})
        return{
            success:true,
            message:"Group is succesfully created !"
        }
    }
    async getOneGroupStudents(id:number){
        const existGroup= await this.prisma.group.findUnique({
            where:{
                id:id
            }
        })
        if(!existGroup) throw new NotFoundException("Group is not found with this id")

        
        const groupStudents= await this.prisma.studentGroup.findMany({
            where:{
                group_id:id,
                status:"active"
            },
            select:{
               
                students:{
                    select:{
                        id:true,
                        first_name:true,
                        last_name:true,
                        phone:true,
                        photo:true,
                        email:true,
                        birth_date:true,
                        address:true,
                        created_at:true
                    }
                }
            }
        })
        const dataFormator= groupStudents.map(el=>el.students)
        return{
            success:true,
            message:"Group is found",
            data:dataFormator
        }
    }   
    async getAllGroups(search:FilterQuerysDto){
        const {groupName,max_student}= search
        
        let where={
            status:Status.active
            
        }
        
        if(groupName){
            where["name"]=groupName
                        

        }
        if(max_student){
            where["max_student"]= max_student
        }
        const data = await this.prisma.group.findMany({
            where,
            select:{
                id:true,
                name:true,
                description:true,
                status:true,
                start_time:true,
                start_date:true,
                max_student:true,
                week_day:true,


                courses:{
                    select:{
                        id:true,
                        name:true
                    }
                },
                teachers:{
                    select:{
                        id:true,
                        first_name:true
                    }
                },
                rooms:{
                    select:{
                        id:true,
                        name:true
                    }

                }

            }
        })
        return{
            success:true,
            message:"All groups",
            data
        }
    }
    async getAllCompletedGroups(){
        const data = await this.prisma.group.findMany({
            where:{status:"completed"},
            select:{
                name:true ,    
                description : true,
                course_id  : true, 
                teacher_id  : true,
                room_id     : true,
                start_date : true, 
                week_day   : true, 
                start_time  : true,
                max_student : true,
                status      : true
            }
        })
        return{
            success:true,
            message:"All groups",
            data
        }
    }
    async getAllPlannedGroups(){
        const data = await this.prisma.group.findMany({
            where:{status:"planned"},
            select:{
                name:true ,    
                description : true,
                course_id  : true, 
                teacher_id  : true,
                room_id     : true,
                start_date : true, 
                week_day   : true, 
                start_time  : true,
                max_student : true,
                status      : true
            }
        })
        return{
            success:true,
            message:"All groups",
            data
        }
    }
    async updateGroup(payload:UpdateGroupDto,groupId:number){
        const existGroup= await this.prisma.group.findUnique({
            where:{
                id:groupId
            }
        })
        if(!existGroup) throw new NotFoundException("Group is not found with this id")
        const data= await this.prisma.group.update({
            where:{
                id:groupId
            },
                data:payload
        })
        return{
            success:true,
            message:"Group succesfully updated"
        }
    }
}

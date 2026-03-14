import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/role';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { TeachersService } from './teachers.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { TeacherCreateDto } from './dto/TeacherCreateDto';
import { UpdateTeacherDto } from './dto/UpdateTeacherDto';

@ApiBearerAuth()
@Controller('teachers')
export class TeachersController {
    constructor(private readonly studentsService: TeachersService) {}
        @ApiOperation({
            summary: `${Role.SUPERADMIN},${Role.ADMIN}`
        })
        @UseGuards(AuthGuard,RolesGuard)
        @Roles(Role.SUPERADMIN,Role.ADMIN)
        @Get("all")
        getAllTeachers(){
            return this.studentsService.getAllTeachers()
        }

        @ApiOperation({
            summary: `${Role.SUPERADMIN},${Role.ADMIN}`
        })
        @UseGuards(AuthGuard,RolesGuard)
        @Roles(Role.SUPERADMIN,Role.ADMIN)
        @Get("all/inactives")
        getAllInActiveTeachers(){
            return this.studentsService.getAllInActiveTeachers()
        }
    
    
    
    
        @ApiOperation({
            summary: `${Role.SUPERADMIN},${Role.ADMIN}`,
            description: "Bu endpointga faqat superadmin va adminga  ruxsat bor"
        })
        @UseGuards(AuthGuard, RolesGuard)
        @Roles(Role.SUPERADMIN, Role.ADMIN)
    
        @ApiConsumes("multipart/form-data")
        @ApiBody({
            schema: {
                type: "object",
                properties: {
                    first_name:{type:"string"},
                    last_name :{type:'string',example:""},
                    password :{type:'string',example:""},     
                    phone :{type:'string',example:""},               
                    email :{type:'string',example:""},       
                    address:{type:'string',example:""},
                    photo :{type:'string', format:"binary"}
                }
            }
        })
        @UseInterceptors(FileInterceptor("photo",{
            storage:diskStorage({
                destination:"src/uploads",
                filename:(req, file, cb)=>{
                    const filename=Date.now()+"."+file.mimetype.split("/") [1] 
                    cb(null,filename) 
                                
                }
            })
        }))
    
        @Post()
        createTeacher(
            @Body() payload: TeacherCreateDto,
            @UploadedFile() photo: Express.Multer.File
        ){
            return  this.studentsService.createTeacher(payload,photo?.filename)
        }
    
    
    
    
    
        @ApiOperation({
             summary: `${Role.SUPERADMIN},${Role.ADMIN}`
        })
        @UseGuards(AuthGuard,RolesGuard)
        @Roles(Role.SUPERADMIN,Role.ADMIN)
        @Delete("delete/:id")
        deleteTeacher(@Param("id",ParseIntPipe) id:number ){
            return this.studentsService.deleteTeacher(id)
        }
    
    
    
        @ApiOperation({
             summary: `${Role.SUPERADMIN},${Role.ADMIN},${Role.TEACHER}`
        })
        @UseGuards(AuthGuard,RolesGuard)
        @Roles(Role.SUPERADMIN,Role.TEACHER,Role.ADMIN)
        @ApiConsumes("multipart/form-data")
        @ApiBody({
            schema:{
                type:"object",
                properties:{
                    first_name: { type: 'string' },
                    last_name: { type: 'string' },
                    password: { type: 'string' },
                    phone: { type: 'string' },
                    email: { type: 'string' },
                    address: { type: 'string' },
                    photo: { type: 'string', format: 'binary' }
            }
        }
        })
        @UseInterceptors(FileInterceptor("photo",{
            storage:diskStorage({
                destination:"src/uploads",
                filename:(req,file,cb)=>{
                    const fileName=Date.now()+"."+file.mimetype.split("/")[1]
                    cb(null,fileName)
                }
            })
        }))
        @Put("update/:id")
    
        updateTeacher(
            @Param("id",ParseIntPipe) id:number,
            @Body() payload:UpdateTeacherDto,
            @UploadedFile() photo?:Express.Multer.File
        ){
            return this.studentsService.updateTeacher(id,payload)
        }

        @ApiOperation({
             summary: `${Role.SUPERADMIN},${Role.ADMIN},${Role.TEACHER}`
        })
        @UseGuards(AuthGuard,RolesGuard)
        @Roles(Role.SUPERADMIN,Role.TEACHER,Role.ADMIN)
        @Get("one/groups/:id")
        getOneTeacherGroups(@Param("id" ,ParseIntPipe) id :number){
            return this.studentsService.getOneTeacherGroups(id)
        }

    
}

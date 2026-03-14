import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UnsupportedMediaTypeException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { StudentsService } from './students.service';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentCreateDto } from './dto/StudentCreateDto';
import { diskStorage } from 'multer';
import { UpdateStudentDto } from './dto/UpdateStudentDto';
@ApiBearerAuth()
@Controller('students')
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) {}
    @ApiOperation({
        summary: `${Role.SUPERADMIN},${Role.ADMIN}`
    })
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.SUPERADMIN,Role.ADMIN)
    @Get("all")
    getAllStudents(){
        return this.studentsService.getAllStudents()
    }

    @ApiOperation({
        summary: `${Role.SUPERADMIN},${Role.ADMIN}`
    })
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.SUPERADMIN,Role.ADMIN)
    @Get("all/inactive")
    getAllInactiveStudents(){
        return this.studentsService.getAllInActiveStudents()
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
                birth_date:{type:'string', format:"date",example:"2000-01-02"},
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
    createStudent(
        @Body() payload: StudentCreateDto,
        @UploadedFile() photo: Express.Multer.File
    ){
        return  this.studentsService.createStudent(payload,photo?.filename)
    }





    @ApiOperation({
         summary: `${Role.SUPERADMIN},${Role.ADMIN}`
    })
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.SUPERADMIN,Role.ADMIN)
    @Delete("delete/:id")
    deleteStudent(@Param("id",ParseIntPipe) id:number ){
        return this.studentsService.deleteStudent(id)
    }



    @ApiOperation({
         summary: `${Role.SUPERADMIN},${Role.ADMIN},${Role.STUDENT}`
    })
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.SUPERADMIN,Role.STUDENT,Role.ADMIN)
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
                birth_date: { type: 'string', format: 'date' },
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
        }),
        fileFilter:(req, file, cb)=>{
            const existFile=["png","svg","jpg","jpeg"]
            if(!existFile.includes(file.mimetype.split("/")[1])){
                cb(new UnsupportedMediaTypeException(),false)
            }
            cb(null,true)  
        },
        
    }))
    @Put("update/:id")

    updateStudent(
        @Param("id",ParseIntPipe) id:number,
        @Body() payload:UpdateStudentDto,
        @UploadedFile() photo?:Express.Multer.File
    ){
        return this.studentsService.updateStudent(id,payload,photo?.filename)
    }
    @ApiOperation({
         summary: `${Role.SUPERADMIN},${Role.ADMIN},${Role.STUDENT}`
    })
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.SUPERADMIN,Role.STUDENT,Role.ADMIN)
    @Get("one/all/groups/:id")

    getOneStudentGroups(@Param("id",ParseIntPipe) id:number){
        return this.studentsService.getOneStudentGroups(id)
    }

   
}

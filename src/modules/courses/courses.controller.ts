import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CourseLevel, Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { CreateCourseDto } from './dto/create.course.dto';
import { UpdateCourseDto } from './dto/update.course.dto';
@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService:CoursesService){}
    
        @ApiOperation({
            summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
        })
        @UseGuards(AuthGuard,RolesGuard)
        @Roles(Role.SUPERADMIN,Role.ADMIN)
        @Get("all")
        getALlCourses(){
            return this.coursesService.getALlCourses()
        }

        @ApiOperation({
            summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
        })
        @UseGuards(AuthGuard,RolesGuard)
        @Roles(Role.SUPERADMIN,Role.ADMIN)
        @Get("all/inactives")
        getALlInActivesCourses(){
            return this.coursesService.getALlInActivesCourses()
        }
    
        @ApiOperation({
            summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
        })
        @UseGuards(AuthGuard,RolesGuard)
        @Roles(Role.SUPERADMIN,Role.ADMIN)
        
        @Post("create")
        createCourse(@Body() payload:CreateCourseDto){
            return this.coursesService.createCourse(payload)
        }
        
        @ApiOperation({
            summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
        })
        @UseGuards(AuthGuard,RolesGuard)
        @Roles(Role.SUPERADMIN,Role.ADMIN)
        @Get("one/:courseId")
        getOneCourse(@Param("courseId",ParseIntPipe) courseId:number){
            return this.coursesService.getOneCourse(courseId)
        }



        @ApiOperation({
            summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
        })
        @UseGuards(AuthGuard,RolesGuard)
        @Roles(Role.SUPERADMIN,Role.ADMIN)
        @Delete("delete/:courseId")
        deleteCourse(@Param("courseId",ParseIntPipe) courseId:number){
            return this.coursesService.deleteCourse(courseId)
        }
    
        @ApiOperation({
            summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
        })
        @UseGuards(AuthGuard,RolesGuard)
        @Roles(Role.SUPERADMIN,Role.ADMIN)
    
        @Put("update/:courseId")
        updateCourse(@Body() payload:UpdateCourseDto,@Param("courseId",ParseIntPipe) courseId:number){
            return this.coursesService.updateCourse(payload,courseId)
        }
    
    
}

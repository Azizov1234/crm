import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { StudentGroupService } from './student-group.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { CreatStudentGroupDto } from './dto/create.student.group.dto';

@ApiBearerAuth()
@Controller('student-group')
export class StudentGroupController {
    constructor(private readonly studentGroupService:StudentGroupService){}

    @ApiOperation({
        summary:`${Role.SUPERADMIN,Role.ADMIN}`
    })
            
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.SUPERADMIN,Role.ADMIN)
    @Post("create")
    createStudentGroups(@Body() payload:CreatStudentGroupDto){

        return this.studentGroupService.createStudentGroups(payload)
    }

    @ApiOperation({
        summary:`${Role.SUPERADMIN,Role.ADMIN,Role.STUDENT}`
    })
            
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.SUPERADMIN,Role.ADMIN,Role.STUDENT)
    @Get("one/:id")
    getOneStudentGroups(@Param("id",ParseIntPipe) id : number){
        return this.studentGroupService.getOneStudentGroups(id)
    }

    @ApiOperation({
        summary:`${Role.SUPERADMIN,Role.ADMIN}`
    })
            
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.SUPERADMIN,Role.ADMIN)
    @Get('all')

    getAllStudentsGroups(){
        return this.studentGroupService.getAllStudentsGroups()
    }

    @ApiOperation({
        summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
    })
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.SUPERADMIN,Role.ADMIN)
    @Delete("delete/:courseId")
    deleteStudentGroup(){
    }
        
    @ApiOperation({
        summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
    })
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.SUPERADMIN,Role.ADMIN)
        
    @Put("update/:courseId")
        updateStudentGroups(){
    }

}

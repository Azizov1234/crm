import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/role';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create.dto.groups';
import { FilterQuerysDto } from './dto/FilterQuerysDto';
import { UpdateGroupDto } from './dto/update.dto';

@ApiBearerAuth()

@Controller('groups')
export class GroupsController {
    constructor(private readonly groupsService:GroupsService){}
        
        @ApiOperation({
            summary:`${Role.SUPERADMIN,Role.ADMIN}`
        })
        
        @UseGuards(AuthGuard,RolesGuard)
        @Roles(Role.SUPERADMIN,Role.ADMIN)
        @Post("create")
        createGroup(@Body() payload:CreateGroupDto){
            return this.groupsService.createGroup(payload)
            
        }


        @ApiOperation({
            summary:`${Role.SUPERADMIN,Role.ADMIN}`
        })
        
        @UseGuards(AuthGuard,RolesGuard)
        @Roles(Role.SUPERADMIN,Role.ADMIN)
        @Get("all")
        getAllGroups(
            @Query() search:FilterQuerysDto
        ){
            return this.groupsService.getAllGroups(search)
        }


        @ApiOperation({
            summary:`${Role.SUPERADMIN,Role.ADMIN}`
        })
        @UseGuards(AuthGuard,RolesGuard)
        @Roles(Role.SUPERADMIN,Role.ADMIN)
        @Get("one/students/:id")

        getOneGroupStudents(@Param("id" ,ParseIntPipe) id :number){
            return this.groupsService.getOneGroupStudents(id)
        }



         @ApiOperation({
            summary:`${Role.SUPERADMIN,Role.ADMIN}`
        })
        
        @UseGuards(AuthGuard,RolesGuard)
        @Roles(Role.SUPERADMIN,Role.ADMIN)
        @Get("all/completeds")
        getAllCompletedGroups(){
            return this.groupsService.getAllCompletedGroups()
        }

         @ApiOperation({
            summary:`${Role.SUPERADMIN,Role.ADMIN}`
        })
        
        @UseGuards(AuthGuard,RolesGuard)
        @Roles(Role.SUPERADMIN,Role.ADMIN)
        @Get("all/planneds")
        getAllPlannedGroups(){
            return this.groupsService.getAllPlannedGroups()
        }


        @Put("update/:groupId")
        updateGroup(@Body() payload:UpdateGroupDto,@Param("groupId",ParseIntPipe) groupId:number){
            return this.groupsService.updateGroup(payload,groupId)
        }

 

}

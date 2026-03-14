import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create.admin.dto';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/role';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/role.guard';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(private readonly usersService:UsersService) { 
      
    }
    @ApiOperation({
        summary:`${Role.SUPERADMIN},${Role.ADMIN}`
    })
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.SUPERADMIN,Role.ADMIN)
    @Post("admin")
        createAdmin(@Body() payload:CreateUserDto){
            return this.usersService.createAdmin(payload)
        }
    @ApiOperation({
        summary:`${Role.SUPERADMIN}`
    })
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.SUPERADMIN)
    @Get("all/admins")
    getAllAdmins(){
        return this.usersService.getAllAdmins()
    }

}

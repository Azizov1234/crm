import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { Role } from '@prisma/client';
import { CreateRoomDto } from './dto/create.room.dto';
import { UpdateRoomDto } from './dto/update.room.dto';
@ApiBearerAuth()
@Controller('rooms')
export class RoomsController {
    constructor(private readonly roomsService:RoomsService){}

    @ApiOperation({
            summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
    })
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.SUPERADMIN,Role.ADMIN)
    @Get("all")
    getAllRooms(){
        return this.roomsService.getALlRooms()
    }

    @ApiOperation({
            summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
    })
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.SUPERADMIN,Role.ADMIN)
    @Get("all/inactives")
    getAllInActivesRooms(){
        return this.roomsService.getALlInActivesRooms()
    }

    @ApiOperation({
            summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
    })
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.SUPERADMIN,Role.ADMIN)
    @Post("create")
    createRoom(@Body() payload:CreateRoomDto){
        return this.roomsService.createRoom(payload)
    }


    @ApiOperation({
            summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
    })
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.SUPERADMIN,Role.ADMIN)
    @Delete("delete")
    deleteRoom(@Param("roomId",ParseIntPipe) roomId:number){
        return this.roomsService.deleteRoom(roomId)
    }

    @ApiOperation({
            summary:`${Role.SUPERADMIN} ${Role.ADMIN}`
    })
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(Role.SUPERADMIN,Role.ADMIN)

    @Put("update/:roomId")
    updateRoom(@Body() payload:UpdateRoomDto,@Param("roomId",ParseIntPipe) roomId:number){
        return this.roomsService.updateRoom(payload,roomId)
    }


}

import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService){}
  
  @ApiOperation({
    summary:`${Role.ADMIN} ${Role.TEACHER} ${Role.SUPERADMIN}`
  })
  @UseGuards(AuthGuard,RolesGuard)
  @Roles(Role.ADMIN,Role.TEACHER,Role.SUPERADMIN)
  @Post()
  createLesson(@Body() payload: CreateLessonDto,@Req() req:Request){
    return this.lessonsService.createLesson(payload,req["user"])
  }


  @ApiOperation({
    summary:`${Role.ADMIN}  ${Role.SUPERADMIN}`
  })
  @UseGuards(AuthGuard,RolesGuard)
  @Roles(Role.ADMIN,Role.SUPERADMIN)
  @Get("all")
  findAllLessons() {
    return this.lessonsService.findAllLessons();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
    return this.lessonsService.update(+id, updateLessonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lessonsService.remove(+id);
  }
}

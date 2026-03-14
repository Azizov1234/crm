import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { HomeworkService } from './homework.service';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { UpdateHomeworkDto } from './dto/update-homework.dto';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('homework')
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) { }
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
        lesson_id:{type:"number" },
        group_id:{type:"number"},
        title:{type:"string"},
        file: { type: 'string', format: "binary" }
      }
    }
  })
  @UseInterceptors(FileInterceptor("file", {


    storage: diskStorage({
      destination: "src/uploads",
      filename: (req, file, cb) => {
        const filename = Date.now() + "." + file.mimetype.split("/")[1]
        cb(null, filename)

      }
    })
  }))
  @Post()
  createHomeWork(@Body() payload: CreateHomeworkDto,@UploadedFile() file:Express.Multer.File) {
    return this.homeworkService.create(payload,file?.filename);
  }

  @Get()
  findAll() {
    return this.homeworkService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.homeworkService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHomeworkDto: UpdateHomeworkDto) {
    return this.homeworkService.update(+id, updateHomeworkDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.homeworkService.remove(+id);
  }
}

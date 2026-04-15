import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../decorators/role';
import {
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  validateFile,
  validateImage,
  validateVideo,
} from '../functions/check.file';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/role.guard';
import { CloudinaryService } from './cloudinary.service';

@ApiTags('Uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('image')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Rasm yuklash' })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_IMAGE_SIZE } }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File yuborilmadi');
    }

    validateImage(file);

    const result = await this.cloudinaryService.uploadFile(file, {
      resource_type: 'image',
      folder: 'academy/images',
    });

    return {
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    };
  }

  @Post('video')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Video yuklash' })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_VIDEO_SIZE } }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File yuborilmadi');
    }

    validateVideo(file);

    const result = await this.cloudinaryService.uploadFile(file, {
      resource_type: 'video',
      folder: 'academy/videos',
    });

    return {
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    };
  }

  @Post('document')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Hujjat yuklash' })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE } }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File yuborilmadi');
    }

    validateFile(file);

    const result = await this.cloudinaryService.uploadFile(file, {
      resource_type: 'raw',
      folder: 'academy/documents',
    });

    return {
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    };
  }
}

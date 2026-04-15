import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  MAX_IMAGE_SIZE,
  validateImage,
} from '../../common/functions/check.file';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { CloudinaryService } from '../../common/uploads/cloudinary.service';
import { successResponse } from '../../common/utils/api-response';
import { UpdateOrganizationSettingsDto } from './dto/update-organization-settings.dto';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('organization')
  @ApiOperation({ summary: 'Organization sozlamalari' })
  async getOrganization(@CurrentUser() user: RequestUser) {
    const data = await this.settingsService.getOrganization(user);
    return successResponse('Organization sozlamalari', data);
  }

  @Patch('organization')
  @ApiOperation({ summary: 'Organization sozlamalarini yangilash' })
  async updateOrganization(
    @Body() dto: UpdateOrganizationSettingsDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.settingsService.updateOrganization(
      dto,
      user,
      request,
    );
    return successResponse('Organization yangilandi', data);
  }

  @Post('logo')
  @ApiOperation({ summary: 'Organization logo yuklash' })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_IMAGE_SIZE } }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  async uploadLogo(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    if (!file) {
      throw new BadRequestException('File yuborilmadi');
    }

    validateImage(file);

    const uploaded = await this.cloudinaryService.uploadFile(file, {
      resource_type: 'image',
      folder: 'academy/logos',
    });

    const data = await this.settingsService.updateOrganization(
      {
        logoUrl: uploaded.secure_url,
      },
      user,
      request,
    );

    return successResponse('Logo yangilandi', data);
  }
}


import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/role';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import {
  paginatedResponse,
  successResponse,
} from '../../common/utils/api-response';
import { BulkSendSmsDto } from './dto/bulk-send-sms.dto';
import { CreateSmsTemplateDto } from './dto/create-sms-template.dto';
import { SendDuePaymentRemindersDto } from './dto/send-due-payment-reminders.dto';
import { SendRoleNotificationDto } from './dto/send-role-notification.dto';
import { SendSmsDto } from './dto/send-sms.dto';
import { SendStaffSalaryNotificationDto } from './dto/send-staff-salary-notification.dto';
import { SmsLogQueryDto } from './dto/sms-log-query.dto';
import { UpdateSmsTemplateDto } from './dto/update-sms-template.dto';
import { SmsService } from './sms.service';

@ApiTags('SMS')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Bitta SMS yuborish' })
  async send(
    @Body() dto: SendSmsDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.smsService.send(dto, user, request);
    return successResponse('SMS yuborildi', data);
  }

  @Post('bulk-send')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Bulk SMS yuborish' })
  async bulkSend(
    @Body() dto: BulkSendSmsDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.smsService.bulkSend(dto, user, request);
    return successResponse('Bulk SMS yuborildi', data);
  }

  @Post('notify/roles')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Role boyicha notification yuborish' })
  async sendRoleNotification(
    @Body() dto: SendRoleNotificationDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.smsService.sendRoleNotification(dto, user, request);
    return successResponse('Role boyicha notification yuborildi', data);
  }

  @Post('notify/due-payments')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Tolov muddati yaqinlashganlar uchun reminder yuborish' })
  async sendDuePaymentReminders(
    @Body() dto: SendDuePaymentRemindersDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.smsService.sendDuePaymentReminders(dto, user, request);
    return successResponse('Tolov reminderlari yuborildi', data);
  }

  @Post('notify/staff-salary')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Xodimga oylik tolov notification yuborish' })
  async sendStaffSalaryNotification(
    @Body() dto: SendStaffSalaryNotificationDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.smsService.sendStaffSalaryNotification(
      dto,
      user,
      request,
    );
    return successResponse('Xodimga oylik notification yuborildi', data);
  }

  @Get('logs')
  @ApiOperation({ summary: 'SMS loglar' })
  async logs(@Query() query: SmsLogQueryDto, @CurrentUser() user: RequestUser) {
    const result = await this.smsService.logs(query, user);
    return paginatedResponse(result.data, result.meta);
  }

  @Get('templates')
  @ApiOperation({ summary: 'SMS templatelar' })
  async templates(
    @Query() query: SmsLogQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.smsService.templates(query, user);
    return paginatedResponse(result.data, result.meta);
  }

  @Post('templates')
  @ApiOperation({ summary: 'SMS template yaratish' })
  async createTemplate(
    @Body() dto: CreateSmsTemplateDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.smsService.createTemplate(dto, user, request);
    return successResponse('SMS template yaratildi', data);
  }

  @Patch('templates/:id')
  @ApiOperation({ summary: 'SMS template yangilash' })
  async updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateSmsTemplateDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.smsService.updateTemplate(id, dto, user, request);
    return successResponse('SMS template yangilandi', data);
  }

  @Patch('templates/:id/delete')
  @ApiOperation({ summary: 'SMS template soft delete' })
  async deleteTemplate(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.smsService.deleteTemplate(id, user, request);
    return successResponse('SMS template ochirildi', data);
  }
}

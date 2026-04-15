import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { successResponse } from '../../common/utils/api-response';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Tizimga kirish' })
  async login(@Body() dto: LoginDto, @Req() request: Request) {
    const data = await this.authService.login(dto, request);
    return successResponse('Login muvaffaqiyatli', data);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Joriy foydalanuvchi' })
  async me(@CurrentUser() user: RequestUser) {
    const data = await this.authService.me(user);
    return successResponse('Foydalanuvchi malumotlari', data);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Tizimdan chiqish' })
  async logout(@CurrentUser() user: RequestUser, @Req() request: Request) {
    await this.authService.logout(user, request);
    return successResponse('Logout muvaffaqiyatli', { logout: true });
  }
}

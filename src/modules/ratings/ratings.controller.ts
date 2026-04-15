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
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { RequestUser } from '../../common/interfaces/request-user.interface';
import {
  paginatedResponse,
  successResponse,
} from '../../common/utils/api-response';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingQueryDto } from './dto/rating-query.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { RatingsService } from './ratings.service';

@ApiTags('Ratings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @ApiOperation({ summary: 'Reyting yaratish' })
  async create(
    @Body() dto: CreateRatingDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.ratingsService.create(dto, user, request);
    return successResponse('Reyting yaratildi', data);
  }

  @Get()
  @ApiOperation({ summary: 'Reytinglar royxati' })
  async findAll(
    @Query() query: RatingQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.ratingsService.findAll(query, user);
    return paginatedResponse(result.data, result.meta);
  }

  @Get('top')
  @ApiOperation({ summary: 'Top reytinglar' })
  async top(@Query() query: RatingQueryDto, @CurrentUser() user: RequestUser) {
    const data = await this.ratingsService.top(query, user);
    return successResponse('Top reytinglar', data);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Student reytinglari' })
  async byStudent(
    @Param('studentId') studentId: string,
    @Query() query: RatingQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.ratingsService.byStudent(studentId, query, user);
    return paginatedResponse(result.data, result.meta);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Reytingni yangilash' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRatingDto,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.ratingsService.update(id, dto, user, request);
    return successResponse('Reyting yangilandi', data);
  }

  @Patch(':id/delete')
  @ApiOperation({ summary: 'Reytingni soft delete qilish' })
  async softDelete(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const data = await this.ratingsService.softDelete(id, user, request);
    return successResponse('Reyting ochirildi', data);
  }
}

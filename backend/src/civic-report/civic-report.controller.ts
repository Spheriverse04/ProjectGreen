import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Express } from 'express';

import { CivicReportService } from './civic-report.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuthUser } from '../auth/auth-user.decorator';

@Controller('civic-report')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CivicReportController {
  constructor(private readonly civicReportService: CivicReportService) {}

  @Post()
  @Roles('CITIZEN')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async createReport(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @AuthUser() authUser: { userId: string },
  ) {
    const { title, description, type, latitude, longitude } = body;
    if (!title || !latitude || !longitude || !type)
      throw new BadRequestException('Missing required fields');

    return this.civicReportService.createReport({
      title,
      description: description || '',
      type,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      imageUrl: file ? `/uploads/${file.filename}` : null,
      createdById: authUser.userId,
    });
  }

  @Get()
  async getAllReports(@AuthUser() authUser: { userId: string }) {
    return this.civicReportService.getAllReports(authUser.userId);
  }

  @Get('my-reports')
  @Roles('CITIZEN')
  async getMyReports(@AuthUser() authUser: { userId: string }) {
    return this.civicReportService.getMyReports(authUser.userId);
  }

  @Get('other-reports')
  @Roles('CITIZEN')
  async getOtherReports(@AuthUser() authUser: { userId: string }) {
    return this.civicReportService.getOtherReports(authUser.userId);
  }

  @Get(':id')
  async getReportById(@Param('id') id: string, @AuthUser() authUser: { userId: string }) {
    return this.civicReportService.getReportById(id, authUser.userId);
  }

  @Post(':id/support')
  @Roles('CITIZEN')
  async supportReport(@Param('id') id: string, @AuthUser() authUser: { userId: string }) {
    return this.civicReportService.supportReport(id, authUser.userId);
  }

  @Post(':id/oppose')
  @Roles('CITIZEN')
  async opposeReport(@Param('id') id: string, @AuthUser() authUser: { userId: string }) {
    return this.civicReportService.opposeReport(id, authUser.userId);
  }
}
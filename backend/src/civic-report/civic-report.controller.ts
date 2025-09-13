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
    @AuthUser() authUser: { sub: string },
  ) {
    const { title, description, type, latitude, longitude } = body;
    if (!title || !latitude || !longitude || !type)
      throw new BadRequestException('Missing required fields');

    return this.civicReportService.createReport({
      title,
      description,
      type,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      imageUrl: file ? `/uploads/${file.filename}` : null,
      createdById: authUser.sub,
    });
  }

  @Get()
  async getAllReports() {
    return this.civicReportService.getAllReports();
  }

  @Get(':id')
  async getReportById(@Param('id') id: string) {
    return this.civicReportService.getReportById(id);
  }

  @Post(':id/support')
  @Roles('CITIZEN')
  async supportReport(@Param('id') id: string, @AuthUser() authUser: { sub: string }) {
    return this.civicReportService.supportReport(id, authUser.sub);
  }

  @Post(':id/oppose')
  @Roles('CITIZEN')
  async opposeReport(@Param('id') id: string, @AuthUser() authUser: { sub: string }) {
    return this.civicReportService.opposeReport(id, authUser.sub);
  }
}


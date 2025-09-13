import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportType } from '@prisma/client';

@Injectable()
export class CivicReportService {
  constructor(private prisma: PrismaService) {}

  async createReport(data: {
    title: string;
    description?: string;
    type: ReportType;
    imageUrl?: string | null;
    latitude: number;
    longitude: number;
    createdById: string;
  }) {
    return this.prisma.civicReport.create({
      data: {
        title: data.title,
        description: data.description || '',
        type: data.type,
        imageUrl: data.imageUrl || null,
        latitude: data.latitude,
        longitude: data.longitude,
        createdById: data.createdById,
      },
    });
  }

  async getAllReports() {
    return this.prisma.civicReport.findMany({
      include: {
        supports: true,
        createdBy: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReportById(id: string) {
    const report = await this.prisma.civicReport.findUnique({
      where: { id },
      include: { supports: true, createdBy: { select: { id: true, name: true } } },
    });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async supportReport(reportId: string, userId: string) {
    const existing = await this.prisma.civicReportSupport.findUnique({
      where: { reportId_userId: { reportId, userId } },
    });
    if (existing) throw new BadRequestException('Already supported or opposed');

    const support = await this.prisma.civicReportSupport.create({
      data: { reportId, userId, support: true },
    });

    await this.prisma.civicReport.update({
      where: { id: reportId },
      data: { supportCount: { increment: 1 } },
    });

    await this.checkThreshold(reportId);
    return support;
  }

  async opposeReport(reportId: string, userId: string) {
    const existing = await this.prisma.civicReportSupport.findUnique({
      where: { reportId_userId: { reportId, userId } },
    });
    if (existing) throw new BadRequestException('Already supported or opposed');

    const oppose = await this.prisma.civicReportSupport.create({
      data: { reportId, userId, support: false },
    });

    await this.prisma.civicReport.update({
      where: { id: reportId },
      data: { oppositionCount: { increment: 1 } },
    });

    await this.checkThreshold(reportId);
    return oppose;
  }

  private async checkThreshold(reportId: string) {
    const supportCount = await this.prisma.civicReportSupport.count({
      where: { reportId, support: true },
    });

    const threshold = 10;
    if (supportCount >= threshold) {
      console.log(`Report ${reportId} reached threshold! Notify workers/ULB 🚨`);
    }
  }
}


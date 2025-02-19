import { Injectable, NotFoundException } from '@nestjs/common';
import { createObjectCsvWriter } from 'csv-writer';
import {  Prisma } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSavedReportFilterDto, SavedReportFilterResponseDto } from './dto/saved-report-filter.dto';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async generateCsvReport(data: { timers: any[], totalHours: number }): Promise<string> {
    const reportsDir = path.resolve('reports');
    await fs.promises.mkdir(reportsDir, { recursive: true });
    
    const filePath = path.resolve(reportsDir, `timer-report-${Date.now()}.csv`);
    
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'userName', title: 'User Name' },
        { id: 'projectName', title: 'Project Name' },
        { id: 'duration', title: 'Duration (Hours)' },
        { id: 'startTime', title: 'Start Time' },
        { id: 'endTime', title: 'End Time' },
        { id: 'createdAt', title: 'Created At' },
        { id: 'updatedAt', title: 'Updated At' },
      ],
    });

    const records = data.timers.map(timer => ({
      id: timer.id,
      userName: timer.user?.email || 'N/A',
      projectName: timer.project?.name || 'N/A',
      duration: (timer.duration / 3600).toFixed(2),
      startTime: timer.startTime ? new Date(timer.startTime).toISOString() : 'N/A',
      endTime: timer.endTime ? new Date(timer.endTime).toISOString() : 'N/A',
      createdAt: timer.createdAt ? new Date(timer.createdAt).toISOString() : 'N/A',
      updatedAt: timer.updatedAt ? new Date(timer.updatedAt).toISOString() : 'N/A',
    }));

    // Add summary row
    records.push({
      id: 'TOTAL' as any,
      userName: '',
      projectName: '',
      duration: data.totalHours.toString(),
      startTime: '',
      endTime: '',
      createdAt: '' as never,
      updatedAt: '' as never,
    });

    await csvWriter.writeRecords(records);
    return filePath;
  }

  async createSavedFilter(
    userId: number,
    dto: CreateSavedReportFilterDto,
  ): Promise<SavedReportFilterResponseDto> {
    return this.prisma.savedReportFilter.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async getSavedFilters(userId: number): Promise<SavedReportFilterResponseDto[]> {
    return this.prisma.savedReportFilter.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteSavedFilter(userId: number, filterId: number): Promise<void> {
    const filter = await this.prisma.savedReportFilter.findFirst({
      where: { id: filterId, userId },
    });

    if (!filter) {
      throw new NotFoundException('Saved filter not found');
    }

    await this.prisma.savedReportFilter.delete({
      where: { id: filterId },
    });
  }
} 
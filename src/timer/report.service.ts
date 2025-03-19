import { Injectable, NotFoundException } from '@nestjs/common';
import { createObjectCsvWriter } from 'csv-writer';
import { Timer } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSavedReportFilterDto,
  SavedReportFilterResponseDto,
} from './dto/saved-report-filter.dto';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async generateCsvReport(data: {
    timers: any[];
    totalHours: number;
  }): Promise<string> {
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

    const records = data.timers.map((timer) => ({
      id: timer.id,
      userName: timer.user?.email || 'N/A',
      projectName: timer.project?.name || 'N/A',
      duration: (timer.duration / 3600).toFixed(2),
      startTime: timer.startTime
        ? new Date(timer.startTime).toISOString()
        : 'N/A',
      endTime: timer.endTime ? new Date(timer.endTime).toISOString() : 'N/A',
      createdAt: timer.createdAt
        ? new Date(timer.createdAt).toISOString()
        : 'N/A',
      updatedAt: timer.updatedAt
        ? new Date(timer.updatedAt).toISOString()
        : 'N/A',
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

  async getSavedFilters(
    userId: number,
  ): Promise<SavedReportFilterResponseDto[]> {
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

  generateExcelReportSummaryByProject(data: {
    timers: Timer[];
    totalHours: number;
  }): Promise<string> {
    const filePath = path.resolve('reports', `timer-report-${Date.now()}.xlsx`);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Summary');
    
    // Group timers by project
    const projectMap = new Map<
      string,
      {
        projectId: number;
        projectName: string;
        descriptions: Map<string, { description: string; totalTime: number; timers: Timer[] }>;
        totalTime: number;
        timers: Timer[];
      }
    >();

    // Process all timers and group them by project and description
    for (const timer of data.timers) {
      const project = (timer as any).project;
      const projectName = project?.name || 'No Project';
      const projectId = timer.projectId || 0;
      const description = timer.description || 'No Description';

      // Calculate duration in hours
      let duration = 0;
      if (timer.startTime && timer.endTime) {
        duration =
          (new Date(timer.endTime).getTime() -
            new Date(timer.startTime).getTime()) /
          (1000 * 60 * 60);
      }

      // Create project entry if it doesn't exist
      if (!projectMap.has(projectName)) {
        projectMap.set(projectName, {
          projectId,
          projectName,
          descriptions: new Map(),
          totalTime: 0,
          timers: [],
        });
      }

      const projectData = projectMap.get(projectName);
      projectData.timers.push(timer);
      projectData.totalTime += duration;

      // Create description entry if it doesn't exist
      if (!projectData.descriptions.has(description)) {
        projectData.descriptions.set(description, {
          description,
          totalTime: 0,
          timers: [],
        });
      }

      // Add timer to description group
      const descriptionData = projectData.descriptions.get(description);
      descriptionData.timers.push(timer);
      descriptionData.totalTime += duration;
    }

    // Define columns
    worksheet.columns = [
      { header: 'Project', key: 'project', width: 30 },
      { header: 'Description', key: 'description', width: 40 },
      {
        header: 'Time (h)',
        key: 'timeFormatted',
        width: 15,
        style: { alignment: { horizontal: 'right' } },
      },
      {
        header: 'Time (decimal)',
        key: 'timeDecimal',
        width: 15,
        style: { alignment: { horizontal: 'right' } },
      },
      {
        header: 'Amount (USD)',
        key: 'amount',
        width: 15,
        style: { alignment: { horizontal: 'right' } },
      },
    ];

    // Add header styling
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Variables for grand total
    let grandTotalTimeDecimal = 0;
    let grandTotalAmount = 0;
    let rowCount = 1; // Start with header row

    // Process each project and add to worksheet
    for (const [projectName, projectData] of projectMap.entries()) {
      // Format project total time as HH:MM:SS
      const projectHours = Math.floor(projectData.totalTime);
      const projectMinutes = Math.floor((projectData.totalTime - projectHours) * 60);
      const projectSeconds = Math.floor(
        ((projectData.totalTime - projectHours) * 60 - projectMinutes) * 60,
      );
      const projectTimeFormatted = `${projectHours.toString().padStart(2, '0')}:${projectMinutes.toString().padStart(2, '0')}:${projectSeconds.toString().padStart(2, '0')}`;

      // Calculate project amount
      const rate = 20; // Default rate in USD per hour
      const projectAmount = projectData.totalTime * rate;

      // Add project summary row
      rowCount++;
      const projectRow = worksheet.addRow({
        project: projectName,
        description: '', // Empty description for project summary row
        timeFormatted: projectTimeFormatted,
        timeDecimal: projectData.totalTime.toFixed(2),
        amount: projectAmount.toFixed(2),
      });

      // Style project row
      projectRow.font = { bold: true };
      projectRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF0F0F0' },
      };

      // Add description rows for this project
      for (const [descName, descData] of projectData.descriptions.entries()) {
        // Format description time as HH:MM:SS
        const descHours = Math.floor(descData.totalTime);
        const descMinutes = Math.floor((descData.totalTime - descHours) * 60);
        const descSeconds = Math.floor(
          ((descData.totalTime - descHours) * 60 - descMinutes) * 60,
        );
        const descTimeFormatted = `${descHours.toString().padStart(2, '0')}:${descMinutes.toString().padStart(2, '0')}:${descSeconds.toString().padStart(2, '0')}`;

        // Calculate description amount
        const descAmount = descData.totalTime * rate;

        // Add description row
        rowCount++;
        worksheet.addRow({
          project: '', // Empty project name for description rows
          description: descName,
          timeFormatted: descTimeFormatted,
          timeDecimal: descData.totalTime.toFixed(2),
          amount: descAmount.toFixed(2),
        });
      }

      // Add empty row after each project group
      rowCount++;
      worksheet.addRow({});

      // Add to grand totals
      grandTotalTimeDecimal += projectData.totalTime;
      grandTotalAmount += projectAmount;
    }

    // Format grand total time
    const totalHours = Math.floor(grandTotalTimeDecimal);
    const totalMinutes = Math.floor((grandTotalTimeDecimal - totalHours) * 60);
    const totalSeconds = Math.floor(
      ((grandTotalTimeDecimal - totalHours) * 60 - totalMinutes) * 60,
    );
    const grandTotalTimeFormatted = `${totalHours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;

    // Add grand total row
    rowCount++;
    const totalRow = worksheet.addRow({
      project: 'Total',
      description: '',
      timeFormatted: grandTotalTimeFormatted,
      timeDecimal: grandTotalTimeDecimal.toFixed(2),
      amount: grandTotalAmount.toFixed(2),
    });

    // Style total row
    totalRow.font = { bold: true };
    totalRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFF0CB' },
      };
    });

    // Add outside border to the entire table
    // Define border style
    const borderStyle = {
      style: 'medium' as const,
      color: { argb: 'FF000000' }
    };

    // Apply border to the outside of the table
    // Top border for header row
    worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (!cell.border) cell.border = {};
      cell.border.top = borderStyle;
    });

    // Left and right borders for all rows
    for (let i = 1; i <= rowCount; i++) {
      // Skip empty rows
      if (worksheet.getRow(i).getCell(1).value === null && 
          worksheet.getRow(i).getCell(2).value === null) {
        continue;
      }
      
      // First column - left border
      const firstCell = worksheet.getRow(i).getCell(1);
      if (!firstCell.border) firstCell.border = {};
      firstCell.border.left = borderStyle;
      
      // Last column - right border
      const lastCell = worksheet.getRow(i).getCell(5); // 5 is the last column
      if (!lastCell.border) lastCell.border = {};
      lastCell.border.right = borderStyle;
    }

    // Bottom border for total row
    worksheet.getRow(rowCount).eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (!cell.border) cell.border = {};
      cell.border.bottom = borderStyle;
    });

    // Create reports directory if it doesn't exist
    const reportsDir = path.dirname(filePath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Save workbook to file
    return workbook.xlsx.writeFile(filePath).then(() => {
      return filePath;
    });
  }
}

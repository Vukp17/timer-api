import { Injectable } from '@nestjs/common';
import { createObjectCsvWriter } from 'csv-writer';
import { Timer } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ReportService {
  async generateCsvReport(data: { timers: Timer[], totalHours: number }): Promise<string> {
    // Ensure reports directory exists
    const reportsDir = path.resolve('reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const csvWriter = createObjectCsvWriter({
      path: path.resolve('reports', 'timer-report.csv'),
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
      userName: timer.user?.name || 'N/A',
      projectName: timer.project?.name || 'N/A',
      duration: (timer.duration / 3600).toFixed(2), // Convert seconds to hours
      startTime: timer.startTime ? new Date(timer.startTime).toISOString() : 'N/A',
      endTime: timer.endTime ? new Date(timer.endTime).toISOString() : 'N/A',
      createdAt: timer.createdAt.toISOString(),
      updatedAt: timer.updatedAt.toISOString(),
    }));

    // Add summary row
    records.push({
      id: 'TOTAL',
      userName: '',
      projectName: '',
      duration: data.totalHours.toString(),
      startTime: '',
      endTime: '',
      createdAt: '',
      updatedAt: '',
    });

    await csvWriter.writeRecords(records);
    return path.resolve('reports', 'timer-report.csv');
  }
} 
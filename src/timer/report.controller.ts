import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { TimerService } from './timer.service';
import { Response } from 'express';
import * as fs from 'fs';
import { ReportRequestDto } from './dto/report-request.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('reports')
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly timerService: TimerService,
  ) { }

  
  @UseGuards(JwtAuthGuard)
  @Get('csv')
  async generateCsvReport(
    @Query() query: ReportRequestDto,
    @Res() res: Response,
  ) {
    const { startDate, endDate } = query;
    const data = await this.timerService.getTimersForReport(startDate, endDate);
    const filePath = await this.reportService.generateCsvReport(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=timer-report.csv');

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
} 
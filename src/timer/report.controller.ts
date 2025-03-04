import { Body, Controller, Delete, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { TimerService } from './timer.service';
import { Response } from 'express';
import * as fs from 'fs';
import { ReportRequestDto } from './dto/report-request.dto';
import { AuthGuard, UserReq } from 'src/auth/auth.guard';
import { CreateSavedReportFilterDto } from './dto/saved-report-filter.dto';

@Controller('reports')
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly timerService: TimerService,
  ) { }

  @UseGuards(AuthGuard)
  @Get('csv')
  async generateCsvReport(
    @Query() query: ReportExportRequestDto,
    @Res() res: Response,
    @Req() req: UserReq,
  ) {
    const { startDate, endDate, projectIds, tagIds, clientIds } = query;
    const data = await this.timerService.getTimersForReport(startDate, endDate, projectIds, tagIds, clientIds, req.user.sub);
    const filePath = await this.reportService.generateCsvReport(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=timer-report.csv');

    const fileStream = fs.createReadStream(filePath);
    fileStream.on('end', () => {
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    });
    
    fileStream.pipe(res);
  }

  @UseGuards(AuthGuard)
  @Post('filters')
  async saveReportFilter(
    @Body() dto: CreateSavedReportFilterDto,
    @Req() req: UserReq,
  ) {
    return this.reportService.createSavedFilter(req.user.sub, dto);
  }

  @UseGuards(AuthGuard)
  @Get('filters')
  async getSavedFilters(@Req() req: UserReq) {
    return this.reportService.getSavedFilters(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Delete('filters/:id')
  async deleteSavedFilter(
    @Param('id') id: string,
    @Req() req: UserReq,
  ) {
    return this.reportService.deleteSavedFilter(req.user.sub, +id);
  }
} 
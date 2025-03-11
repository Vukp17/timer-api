import { Module } from '@nestjs/common';
import { TimerService } from './timer.service';
import { TimerController } from './timer.controller';
import { JwtService } from '@nestjs/jwt';
import { CommonService } from 'src/common/common.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProjectService } from 'src/project/project.service';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';

@Module({
  providers: [
    TimerService,
    ProjectService,
    PrismaService,
    JwtService,
    CommonService,
    ReportService,
  ],
  controllers: [TimerController, ReportController],
})
export class TimerModule {}

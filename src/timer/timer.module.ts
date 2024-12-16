import { Module } from '@nestjs/common';
import { TimerService } from './timer.service';
import { TimerController } from './timer.controller';
import { JwtService } from '@nestjs/jwt';
import { CommonService } from 'src/common/common.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProjectService } from 'src/project/project.service';

@Module({
  providers: [TimerService,ProjectService, PrismaService,JwtService,CommonService],
  controllers: [TimerController]
})
export class TimerModule {}

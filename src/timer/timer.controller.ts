// filepath: /c:/Dev/timer-api/src/timer/timer.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
  Param,
  Delete,
} from '@nestjs/common';
import { TimerService, WeeklyGroupedTimers } from './timer.service';
import { AuthGuard, UserReq } from 'src/auth/auth.guard';
import { Prisma, Timer } from '@prisma/client';
import { successResponse, errorResponse } from 'src/response';
import { JwtPayload } from 'jsonwebtoken';
import {
  TimerCreateDto,
  WeeklyGroupedTimersResponse,
} from './dto/grouped-timer.dto';
import { TimerReportRequestDto } from './dto/report-request.dto';

@Controller('timer')
export class TimerController {
  constructor(private timerService: TimerService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getTimersForUser(
    @Req() req: UserReq,
    @Query('search') searchQuery?: string,
    @Query('sortField') sortField?: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    try {
      const response = await this.timerService.getTimersForUser(
        Number(page),
        Number(pageSize),
        req.user.sub,
        searchQuery,
        sortField,
        sortOrder,
      );
      return successResponse('Timers fetched successfully', response);
    } catch (error) {
      return errorResponse('Failed to fetch timers', error);
    }
  }

  @UseGuards(AuthGuard)
  @Post()
  async createTimer(@Req() req: UserReq, @Body() data: TimerCreateDto) {
    try {
      const { projectId, tagId, ...rest } = data;
      const timer: Prisma.TimerCreateInput = {
        ...rest,
        user: {
          connect: {
            id: req.user.sub,
          },
        },
        project: data.projectId
          ? {
              connect: {
                id: data.projectId,
              },
            }
          : undefined,
        tag: data.tagId
          ? {
              connect: {
                id: data.tagId,
              },
            }
          : undefined,
      };
      const response = await this.timerService.create(timer);
      return successResponse('Timer created successfully', response);
    } catch (error) {
      return errorResponse('Failed to create timer', error);
    }
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async updateTimer(@Req() req: UserReq, @Body() data: Timer) {
    try {
      const { projectId, tagId, id, userId, ...rest } = data;
      const res = {
        ...rest,
        user: {
          connect: {
            id: req.user.sub,
          },
        },
        project: data.projectId
          ? {
              connect: {
                id: data.projectId,
              },
            }
          : undefined,
        tag: data.tagId
          ? {
              connect: {
                id: data.tagId,
              },
            }
          : undefined,
      };
      const response = await this.timerService.update(
        Number(req.params.id),
        res,
      );
      return successResponse('Timer updated successfully', response);
    } catch (error) {
      console.log(error);
      return errorResponse('Failed to update timer', error);
    }
  }

  @UseGuards(AuthGuard)
  @Get('running')
  async getRunningTimer(@Req() req: UserReq) {
    try {
      const response = await this.timerService.getRunningTimer(req.user.sub);
      return successResponse('Running timer fetched successfully', response);
    } catch (error) {
      return errorResponse('Failed to fetch running timer', error);
    }
  }

  @UseGuards(AuthGuard)
  @Get('weekly')
  async getTimersByWeeks(
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('searchQuery') searchQuery: string,
    @Query('sortField') sortField: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc',
    @Req() req: UserReq,
  ) {
    const response = await this.timerService.getTimersByWeeks(
      page,
      pageSize,
      req.user.sub,
      searchQuery,
      sortField,
      sortOrder,
    );
    return successResponse('Timers fetched successfully', response);
  }

  @UseGuards(AuthGuard)
  @Post('duplicate/:id')
  async duplicateTimer(@Req() req: UserReq, @Param('id') id: string) {
    const response = await this.timerService.duplicateTimer(Number(id));
    return successResponse('Timer duplicated successfully', response);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteTimer(@Req() req: UserReq, @Param('id') id: string) {
    try {
      const response = await this.timerService.delete(Number(id));
      return successResponse('Timer deleted successfully', response);
    } catch (error) {
      console.log(error);
      return errorResponse('Failed to delete timer', error);
    }
  }

  @UseGuards(AuthGuard)
  @Post('report')
  async getTimerReport(
    @Req() req: UserReq,
    @Body() filters: TimerReportRequestDto,
  ) {
    try {
      const response = await this.timerService.getTimerReport(
        req.user.sub,
        filters,
      );
      return successResponse('Timer report generated successfully', response);
    } catch (error) {
      return errorResponse('Failed to generate timer report', error);
    }
  }
}

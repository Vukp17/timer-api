import { Body, Controller, Get, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { TimerService } from './timer.service';
import { AuthGuard, UserReq } from 'src/auth/auth.guard';
import { Prisma } from '@prisma/client';
import { TimerCreateDto } from './dto/timer-create.dto';

@Controller('timer')
export class TimerController {
    constructor(private timerService: TimerService) { }


    @UseGuards(AuthGuard)
    @Get()
    getTimersForUser(
        @Req() req: UserReq,
        @Query('search') searchQuery?: string,
        @Query('sortField') sortField?: string,
        @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string
    ) {
        return this.timerService.getTimersForUser(Number(page), Number(pageSize), req.user.sub, searchQuery, sortField, sortOrder);
    }

    @UseGuards(AuthGuard)
    @Post()
    createTimer(@Req() req: UserReq, @Body() data: TimerCreateDto) {
        console.log(data);
        const { projectId, tagId, ...rest } = data;
        const timer: Prisma.TimerCreateInput = {
            ...rest,
            user: {
                connect: {
                    id: req.user.sub
                }
            },
            project: data.projectId ? {
                connect: {
                    id: data.projectId
                }
            } : undefined,
            tag: data.tagId ? {
                connect: {
                    id: data.tagId
                }
            } : undefined
        }
        return this.timerService.create(timer);
    }

    @UseGuards(AuthGuard)
    @Put(':id')
    updateTimer(@Req() req: UserReq, @Body() data: Prisma.TimerUpdateInput) {
        return this.timerService.update(Number(req.params.id), data);
    }

}

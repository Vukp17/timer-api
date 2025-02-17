import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CommonService } from 'src/common/common.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GroupedTimers } from './dto/grouped-timer.dto';
import { getWeekEnd, getWeekStart } from 'src/shared/time-util';

export interface WeeklyGroupedTimers {
    weekStart: string;
    weekEnd: string;
    totalHours: number;
    days: GroupedTimers[];
}

@Injectable()
export class TimerService {


    constructor(private prismaService: PrismaService, private commonService: CommonService) { }


    async getTimersForUser(
        page: number,
        pageSize: number,
        userId: number,
        searchQuery?: string,
        sortField?: string,
        sortOrder: 'asc' | 'desc' = 'asc'
    ): Promise<{ groupedTimers: GroupedTimers[]; totalCount: number }> {
        const [timers, total] = await this.prismaService.$transaction([
            this.prismaService.timer.findMany({
                where: {
                    userId: userId,
                    description: {
                        contains: searchQuery,
                    },
                },
                orderBy: this.commonService.getOrderBy(sortField, sortOrder),
                take: pageSize,
                skip: page * pageSize,
                include: {
                    project: true,
                    tag: true,
                },
            }),
            this.prismaService.timer.count({
                where: {
                    userId: userId,
                    description: {
                        contains: searchQuery,
                    },
                },
            }),
        ]);

        // Group timers by day
        const totalCount = total;

        const groupedTimers = timers.reduce((acc, timer) => {
            const date = new Date(timer.startTime).toISOString().split('T')[0];
            let group = acc.find(g => g.date === date);
            if (!group) {
                group = { date, timers: [] };
                acc.push(group);
            }
            group.timers.push(timer);
            return acc;
        }, [] as GroupedTimers[]);

        return { groupedTimers, totalCount };
    }

    async getTimersByWeeks(
        page: number,
        pageSize: number,
        userId: number,
        searchQuery?: string,
        sortField?: string,
        sortOrder: 'asc' | 'desc' = 'asc'
    ): Promise<{ items: WeeklyGroupedTimers[]; total: number, page: number, pageSize: number }> {
        const [timers, total] = await this.prismaService.$transaction([
            this.prismaService.timer.findMany({
                where: {
                    userId: userId,
                    description: {
                        contains: searchQuery,
                    },
                },
                orderBy: this.commonService.getOrderBy(sortField, sortOrder),
                take: pageSize,
                skip: page * pageSize,
                include: {
                    project: true,
                    tag: true,
                },
            }),
            this.prismaService.timer.count({
                where: {
                    userId: userId,
                    description: {
                        contains: searchQuery,
                    },
                },
            }),
        ]);

        // Group timers by week
        const weeklyTimers = timers.reduce((acc, timer) => {
            const startDate = new Date(timer.startTime);
            const weekStart = getWeekStart(startDate);
            const weekEnd = getWeekEnd(startDate);
            const weekKey = weekStart.toISOString().split('T')[0];

            let weekGroup = acc.find(w => w.weekStart === weekKey);
            if (!weekGroup) {
                weekGroup = {
                    weekStart: weekKey,
                    weekEnd: weekEnd.toISOString().split('T')[0],
                    totalHours: 0,
                    days: []
                };
                acc.push(weekGroup);
            }

            // Group by day within the week
            const dayKey = startDate.toISOString().split('T')[0];
            let dayGroup = weekGroup.days.find(d => d.date === dayKey);
            if (!dayGroup) {
                dayGroup = { date: dayKey, timers: [] };
                weekGroup.days.push(dayGroup);
            }
            dayGroup.timers.push(timer);

            // Calculate hours for this timer and add to week total
            if (timer.endTime) {
                const duration = new Date(timer.endTime).getTime() - new Date(timer.startTime).getTime();
                weekGroup.totalHours += duration / (1000 * 60 * 60); // Convert milliseconds to hours
            }

            return acc;
        }, [] as WeeklyGroupedTimers[]);

        // Sort days within each week
        weeklyTimers.forEach(week => {
            week.days.sort((a, b) => a.date.localeCompare(b.date));
            week.totalHours = Math.round(week.totalHours * 100) / 100; // Round to 2 decimal places
        });

        // Sort weeks
        weeklyTimers.sort((a, b) => b.weekStart.localeCompare(a.weekStart));

        return { 
            items:weeklyTimers,
            total:total,
            page:page,
            pageSize:pageSize
        };
    }


    create(timer: Prisma.TimerCreateInput) {
        return this.prismaService.timer.create({
            data: timer,
            
        })
    }
    update(id: number, timer: Prisma.TimerUpdateInput) {
        return this.prismaService.timer.update({
            where: {
                id: id
            },
            data: timer,
            include:{
                project:true,
                tag:true
            }
        })
    }
    delete(id: number) {
        return this.prismaService.timer.delete({
            where: {
                id: id
            }
        })
    }

    async getRunningTimer(userId: number) {
        const data = await this.prismaService.timer.findFirst({
            where: {
                userId: userId,
                endTime: null
            },
            include: {
                project: true,
                tag: true
            }
        })
        return data;
    }
}

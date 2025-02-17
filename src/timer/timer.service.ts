import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CommonService } from 'src/common/common.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GroupedTimers } from './dto/grouped-timer.dto';
import { getWeekEnd, getWeekStart } from 'src/shared/time-util';
import { TimerReportRequestDto, TimerReportResponse, ProjectAggregation, TagAggregation, ClientAggregation } from './dto/report-request.dto';

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

        // Sort days within each week descending
        weeklyTimers.forEach(week => {
            week.days.sort((a, b) => b.date.localeCompare(a.date));
            week.totalHours = Math.round(week.totalHours * 100) / 100; // Round to 2 decimal places
        });

        // Sort weeks
        weeklyTimers.sort((a, b) => b.weekStart.localeCompare(a.weekStart));

        return {
            items: weeklyTimers,
            total: total,
            page: page,
            pageSize: pageSize
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
            include: {
                project: true,
                tag: true
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

    async duplicateTimer(timerId: number) {
        const timer = await this.prismaService.timer.findUnique({
            where: {
                id: timerId
            }
        })
        if (!timer) {
            throw new NotFoundException('Timer not found');
        }
        const { id, ...timerData } = timer;
        const newTimer = await this.prismaService.timer.create({
            data: timerData,
            include: {
                project: true,
                tag: true
            }
        })
        return newTimer;
    }

    async getTimerReport(userId: number, filters: TimerReportRequestDto): Promise<TimerReportResponse> {
        const whereClause: Prisma.TimerWhereInput = {
            userId: userId,
            startTime: {
                gte: filters.fromDate ? new Date(filters.fromDate) : undefined,
                lte: filters.toDate ? new Date(filters.toDate) : undefined,
            },
            projectId: filters.projectIds?.length > 0 ? { in: filters.projectIds } : undefined,
            tagId: filters.tagIds?.length > 0 ? { in: filters.tagIds } : undefined,
            project: filters.clientIds?.length > 0 ? {
                clientId: { in: filters.clientIds }
            } : undefined
        };

        const timers = await this.prismaService.timer.findMany({
            where: whereClause,
            include: {
                project: {
                    include: {
                        client: true
                    }
                },
                tag: true
            }
        });

        // Calculate total hours and earnings
        let totalHours = 0;
        let totalEarnings = 0;
        const projectMap = new Map<number, { hours: number, name: string }>();
        const tagMap = new Map<number, { hours: number, name: string }>();
        const clientMap = new Map<number, { hours: number, name: string }>();
        const dayMap = new Map<string, { hours: number, earnings: number }>();

        timers.forEach(timer => {
            if (timer.endTime) {
                const hours = (new Date(timer.endTime).getTime() - new Date(timer.startTime).getTime()) / (1000 * 60 * 60);
                const earnings = hours * (timer.hourlyRate || 0);

                totalHours += hours;
                totalEarnings += earnings;

                // Aggregate by project
                if (timer.projectId) {
                    const current = projectMap.get(timer.projectId) || { hours: 0, name: timer.project.name };
                    current.hours += hours;
                    projectMap.set(timer.projectId, current);
                }

                // Aggregate by tag
                if (timer.tagId) {
                    const current = tagMap.get(timer.tagId) || { hours: 0, name: timer.tag.name };
                    current.hours += hours;
                    tagMap.set(timer.tagId, current);
                }

                // Aggregate by client
                if (timer.project?.clientId) {
                    const current = clientMap.get(timer.project.clientId) ||
                        { hours: 0, name: timer.project.client.name };
                    current.hours += hours;
                    clientMap.set(timer.project.clientId, current);
                }

                // Update day aggregation to include earnings
                const day = new Date(timer.startTime).toISOString().split('T')[0];
                const currentDay = dayMap.get(day) || { hours: 0, earnings: 0 };
                currentDay.hours += hours;
                currentDay.earnings += earnings;
                dayMap.set(day, currentDay);
            }
        });

        // Convert to arrays and calculate percentages
        const byProject: ProjectAggregation[] = Array.from(projectMap.entries()).map(([id, data]) => ({
            projectId: id,
            projectName: data.name,
            totalHours: Math.round(data.hours * 100) / 100,
            percentage: Math.round((data.hours / totalHours) * 100)
        }));

        const byTag: TagAggregation[] = Array.from(tagMap.entries()).map(([id, data]) => ({
            tagId: id,
            tagName: data.name,
            totalHours: Math.round(data.hours * 100) / 100,
            percentage: Math.round((data.hours / totalHours) * 100)
        }));

        const byClient: ClientAggregation[] = Array.from(clientMap.entries()).map(([id, data]) => ({
            clientId: id,
            clientName: data.name,
            totalHours: Math.round(data.hours * 100) / 100,
            percentage: Math.round((data.hours / totalHours) * 100)
        }));

        const byDay = Array.from(dayMap.entries())
            .map(([date, data]) => ({
                date,
                hours: Math.round(data.hours * 100) / 100,
                percentage: Math.round((data.hours / totalHours) * 100),
                earnings: Math.round(data.earnings * 100) / 100
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return {
            totalHours: Math.round(totalHours * 100) / 100,
            totalEarnings: Math.round(totalEarnings * 100) / 100,
            byProject,
            byTag,
            byClient,
            byDay
        };
    }

    async getTimersForReport(startDate?: string, endDate?: string) {
        const where = {};

        if (startDate || endDate) {
            where['createdAt'] = {};
            if (startDate) {
                where['createdAt']['gte'] = new Date(startDate);
            }
            if (endDate) {
                where['createdAt']['lte'] = new Date(endDate);
            }
        }

        const timers = await this.prismaService.timer.findMany({
            where,
            include: {
                project: true,
                user: {
                    select: {
                        id: true,
                        email: true
                    }
                }
            }
        });

        // Calculate total hours
        const totalHours = timers.reduce((sum, timer) => sum + timer.duration, 0) / 3600; // Convert seconds to hours

        return {
            timers,
            totalHours: Number(totalHours.toFixed(2))
        };
    }

}

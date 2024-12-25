import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CommonService } from 'src/common/common.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GroupedTimers } from './dto/grouped-timer.dto';

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
        const totalCount = Math.ceil(total / pageSize);

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

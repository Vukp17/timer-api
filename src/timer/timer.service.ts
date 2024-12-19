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
    ): Promise<GroupedTimers> {
        const timers = await this.prismaService.timer.findMany({
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

        });

        // Group timers by day
        const groupedTimers = timers.reduce((acc, timer) => {
            const date = new Date(timer.startTime).toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(timer);
            return acc;
        }, {} as GroupedTimers);

        return groupedTimers;
    }
    create(timer: Prisma.TimerCreateInput) {
        return this.prismaService.timer.create({
            data: timer
        })
    }
    update(id: number, timer: Prisma.TimerUpdateInput) {
        return this.prismaService.timer.update({
            where: {
                id: id
            },
            data: timer
        })
    }
    delete(id: number) {
        return this.prismaService.timer.delete({
            where: {
                id: id
            }
        })
    }
}

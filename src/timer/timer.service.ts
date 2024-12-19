import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CommonService } from 'src/common/common.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TimerService {


    constructor(private prismaService: PrismaService,private commonService:CommonService) { }


    getTimersForUser(page: number, pageSize: number, userId: number, searchQuery?: string, sortField?: string, sortOrder: 'asc' | 'desc' = 'asc') {

        return this.prismaService.timer.findMany({
            where: {
                userId: userId,
                description: {
                    contains: searchQuery
                }
            },
            orderBy: this.commonService.getOrderBy(sortField, sortOrder),
            take: pageSize,
            skip: page * pageSize,
            include: {
                project: true,
                
            },

        })
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

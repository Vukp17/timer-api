import { Injectable } from '@nestjs/common';
import { Project, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CommonService } from 'src/common/common.service';
@Injectable()
export class ProjectService {
    constructor(private prisma: PrismaService,private commonService:CommonService) { }
    async getProjectsForUser(
        page: number,
        pageSize: number,
        userId: number,
        searchQuery?: string,
        sortField?: string,
        sortOrder: 'asc' | 'desc' = 'asc') {
        const searchConditions = searchQuery
            ? {
                OR: [
                    {
                        name: {
                            contains: searchQuery,
                        },
                    },
                    {
                        description: {
                            contains: searchQuery,
                        },
                    },
                ],
            }
            : {};


        return this.prisma.project.findMany({
            where: {
                userId,
                ...searchConditions,
            },
            
            orderBy: this.commonService.getOrderBy(sortField, sortOrder),
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                client: true,
            }
        });
    }


    async createProject(data: Prisma.ProjectCreateInput): Promise<Project> {
        return this.prisma.project.create({
            data,
            include:{
                client:true,
            }

        });
    }
    async updateProject(id: number, data: Prisma.ProjectUpdateInput) {
        return this.prisma.project.update({
            where: {
                id,
            },
            data,
            include:{
                client:true,
            }
        });
    }
    async deleteProject(id: number): Promise<Project> {
        return this.prisma.project.delete({
            where: {
                id,
            },
        });
    }
    async getAllProjects(userId: number): Promise<Project[]> {
        return this.prisma.project.findMany({
            where: {
                userId,
            },
        });
    }
}

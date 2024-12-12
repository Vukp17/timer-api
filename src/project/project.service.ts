import { Injectable } from '@nestjs/common';
import { Project, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class ProjectService {
    constructor(private prisma: PrismaService) { }
    async getProjectsForUser(
        page: number,
        pageSize: number,
        userId: number,
        searchQuery?: string,
        sortField?: string,
        sortOrder: 'asc' | 'desc' = 'asc'): Promise<Project[]> {
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
            orderBy: sortField ? { [sortField]: sortOrder } : undefined,
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
    }


    async createProject(data: Prisma.ProjectCreateInput): Promise<Project> {
        return this.prisma.project.create({
            data,
        });
    }
    async updateProject(id: number, data: Prisma.ProjectUpdateInput): Promise<Project> {
        return this.prisma.project.update({
            where: {
                id,
            },
            data,
        });
    }
    async deleteProject(id: number): Promise<Project> {
        return this.prisma.project.delete({
            where: {
                id,
            },
        });
    }
}

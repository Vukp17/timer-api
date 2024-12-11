import { Injectable } from '@nestjs/common';
import { Project,Prisma  } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class ProjectService {
    constructor(private prisma: PrismaService) {}
    async getProjectsForUser(userId: number): Promise<Project[]> {
        return this.prisma.project.findMany({
            where: {
                userId,
            },
        });
    }


    async createProject(data: Prisma.ProjectCreateInput): Promise<Project> {
        return this.prisma.project.create({
            data,
        });
    }
}

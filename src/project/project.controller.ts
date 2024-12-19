// project/project.controller.ts
import { Body, Controller, Delete, Get, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
import { AuthGuard, UserReq } from 'src/auth/auth.guard';
import { ProjectCreateDto } from './dto/project-create.dto';
import { Project } from '@prisma/client';

@Controller('project')
export class ProjectController {
    constructor(private readonly projectService: ProjectService) { }

    @UseGuards(AuthGuard)
    @Get()
    async getUserProjects(
        @Req() req: UserReq,
        @Query('search') searchQuery?: string,
        @Query('sortField') sortField?: string,
        @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string
    ) {
        return this.projectService.getProjectsForUser(Number(page), Number(pageSize), req.user.sub, searchQuery, sortField, sortOrder);
    }

    @UseGuards(AuthGuard)
    @Post()
    async createProject(@Req() req: UserReq, @Body() data: ProjectCreateDto) {
        const { clientId, ...rest } = data;
        const result = {
            ...rest,
            user: {
              connect: { id: req.user.sub },
            },
            client: {
              connect: { id: data.clientId },
            },
          };
        return this.projectService.createProject(result);
    }

    @UseGuards(AuthGuard)
    @Put(':id')
    async updateProject(@Req() req: UserReq, @Body() data: Project) {
        const { id, userId,clientId, ...updateData } = data; // Destructure to exclude id
        const result = {
            ...updateData,
            user: {
                connect: { id: req.user.sub },
            },
            client: {
                connect: { id: data.clientId },
            },
        };
        return this.projectService.updateProject(Number(req.params.id), result);
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    async deleteProject(@Req() req: UserReq) {
        return this.projectService.deleteProject(Number(req.params.id));
    }


    @UseGuards(AuthGuard)
    @Get('all')
    async getAllProjects(@Req() req: UserReq) {
        return this.projectService.getAllProjects(req.user.sub);
    }






}

// project/project.controller.ts
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ProjectService } from './project.service';
import { console } from 'inspector';
import { AuthGuard, UserReq } from 'src/auth/auth.guard';
import { ProjectCreateDto } from './dto/project-create.dto';
import { Project } from '@prisma/client';
import { UserService } from 'src/user/user.service';

@Controller('project')
export class ProjectController {
    constructor(private readonly projectService: ProjectService) { }

    @UseGuards(AuthGuard)
    async getUserProjects(@Req() req: UserReq) {
        return this.projectService.getProjectsForUser(req.user.sub);
    }

    @UseGuards(AuthGuard)
    @Post()
    async createProject(@Req() req: UserReq, @Body() data: ProjectCreateDto) {
        const result = {
            ...data,
            user: {
                connect: { id: req.user.sub }
            }
        }
        return this.projectService.createProject(result);
    }

    



}

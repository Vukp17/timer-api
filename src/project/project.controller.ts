// project/project.controller.ts
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
import { AuthGuard, UserReq } from 'src/auth/auth.guard';
import { ProjectCreateDto } from './dto/project-create.dto';

@Controller('project')
export class ProjectController {
    constructor(private readonly projectService: ProjectService) { }

    @UseGuards(AuthGuard)
    @Get()
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

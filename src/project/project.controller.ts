// project/project.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { AuthGuard, UserReq } from 'src/auth/auth.guard';
import { ProjectCreateDto } from './dto/project-create.dto';
import { Project } from '@prisma/client';
import { errorResponse, successResponse } from 'src/response';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getUserProjects(
    @Req() req: UserReq,
    @Query('search') searchQuery?: string,
    @Query('sortField') sortField?: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    try {
      const response = await this.projectService.getProjectsForUser(
        Number(page),
        Number(pageSize),
        req.user.sub,
        searchQuery,
        sortField,
        sortOrder,
      );
      return successResponse('Projects fetched successfully', response);
    } catch (error) {
      console.log(error);
      return errorResponse('Failed to fetch projects', error);
    }
  }

  @UseGuards(AuthGuard)
  @Post()
  async createProject(@Req() req: UserReq, @Body() data: ProjectCreateDto) {
    try {
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
      const response = await this.projectService.createProject(result);
      return successResponse('Project created successfully', response);
    } catch (error) {
      return errorResponse('Failed to create project', error);
    }
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async updateProject(@Req() req: UserReq, @Body() data: Project) {
    try {
      const { id, userId, clientId, ...updateData } = data; // Destructure to exclude id
      const result = {
        ...updateData,
        user: {
          connect: { id: req.user.sub },
        },
        client: {
          connect: { id: data.clientId },
        },
      };
      const response = await this.projectService.updateProject(
        Number(req.params.id),
        result,
      );
      return successResponse('Project updated successfully', response);
    } catch (error) {
      return errorResponse('Failed to update project', error);
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteProject(@Req() req: UserReq) {
    try {
      await this.projectService.deleteProject(Number(req.params.id));
      return successResponse('Project deleted successfully', {});
    } catch (error) {
      return errorResponse('Failed to delete project', error);
    }
  }

  @UseGuards(AuthGuard)
  @Get('all')
  async getAllProjects(@Req() req: UserReq) {
    try {
      const response = await this.projectService.getAllProjects(req.user.sub);
      return successResponse('All projects fetched successfully', response);
    } catch (error) {
      return errorResponse('Failed to fetch all projects', error);
    }
  }
}

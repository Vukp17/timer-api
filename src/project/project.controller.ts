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
  Param,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { AuthGuard, UserReq } from 'src/auth/auth.guard';
import { ProjectCreateDto } from './dto/project-create.dto';
import { Project } from '@prisma/client';
import { errorResponse, successResponse } from 'src/response';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../common/file-upload.config';
import { Response } from 'express';
import { Express } from 'express';



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

  @UseGuards(AuthGuard)
  @Get(':id')
  async getProjectById(@Req() req: UserReq, @Param('id') id: string) {
    try {
      const response = await this.projectService.getProjectById(Number(id), req.user.sub);
      if (!response) {
        return errorResponse('Project not found', null);
      }
      return successResponse('Project fetched successfully', response);
    } catch (error) {
      return errorResponse('Failed to fetch project', error);
    }
  }

  @UseGuards(AuthGuard)
  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadDocument(
    @Req() req: UserReq,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        return errorResponse('No file uploaded', null);
      }

      const response = await this.projectService.uploadDocument(
        file,
        Number(id),
        req.user.sub,
      );
      return successResponse('Document uploaded successfully', response);
    } catch (error) {
      return errorResponse('Failed to upload document', error);
    }
  }

  @UseGuards(AuthGuard)
  @Get(':id/documents')
  async getProjectDocuments(@Req() req: UserReq, @Param('id') id: string) {
    try {
      const response = await this.projectService.getProjectDocuments(Number(id));
      return successResponse('Documents fetched successfully', response);
    } catch (error) {
      return errorResponse('Failed to fetch documents', error);
    }
  }

  @UseGuards(AuthGuard)
  @Delete('documents/:documentId')
  async deleteDocument(@Req() req: UserReq, @Param('documentId') documentId: string) {
    try {
      const response = await this.projectService.deleteDocument(
        Number(documentId),
        req.user.sub,
      );
      return successResponse('Document deleted successfully', response);
    } catch (error) {
      return errorResponse('Failed to delete document', error);
    }
  }

  @UseGuards(AuthGuard)
  @Get('documents/:documentId/download')
  async downloadDocument(
    @Req() req: UserReq,
    @Param('documentId') documentId: string,
    @Res() res: Response,
  ) {
    try {
      const document = await this.projectService.downloadDocument(
        Number(documentId),
        req.user.sub,
      );

      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${document.filename}"`);
      res.sendFile(document.filePath);
    } catch (error) {
      res.status(400).json(errorResponse('Failed to download document', error));
    }
  }
}

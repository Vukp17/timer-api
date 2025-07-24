import { Injectable } from '@nestjs/common';
import { Project, Prisma, ProjectDocument } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CommonService } from 'src/common/common.service';
import { ProjectDocumentDto } from './dto/project-document.dto';
import * as fs from 'fs';
import * as path from 'path';
import { Express } from 'express';
import multer from "multer";

@Injectable()
export class ProjectService {
  constructor(
    private prisma: PrismaService,
    private commonService: CommonService,
  ) {}
  async getProjectsForUser(
    page: number,
    pageSize: number,
    userId: number,
    searchQuery?: string,
    sortField?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{
    items: Project[];
    total: number;
    page: number;
    pageSize: number;
  }> {
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

    const whereClause = {
      userId,
      ...searchConditions,
    };

    // Get total count of matching records
    const total = await this.prisma.project.count({
      where: whereClause,
    });

    const projects = await this.prisma.project.findMany({
      where: whereClause,
      orderBy: this.commonService.getOrderBy(sortField, sortOrder),
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        client: true,
      },
    });

    return {
      items: projects,
      total,
      page,
      pageSize,
    };
  }

  async createProject(data: Prisma.ProjectCreateInput): Promise<Project> {
    return this.prisma.project.create({
      data,
      include: {
        client: true,
      },
    });
  }
  async updateProject(id: number, data: Prisma.ProjectUpdateInput) {
    return this.prisma.project.update({
      where: {
        id,
      },
      data,
      include: {
        client: true,
      },
    });
  }
  async deleteProject(id: number): Promise<Project> {
    return this.prisma.project.delete({
      where: {
        id,
      },
    });
  }
  async getAllProjects(
    userId: number,
    page: number = 1,
    pageSize: number = 10,
    sortField?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{
    items: Project[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const whereClause = {
      userId,
    };

    // Get total count of matching records
    const total = await this.prisma.project.count({
      where: whereClause,
    });

    const projects = await this.prisma.project.findMany({
      where: whereClause,
      orderBy: this.commonService.getOrderBy(sortField, sortOrder),
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        client: true,
      },
    });

    return {
      items: projects,
      total,
      page,
      pageSize,
    };
  }

  // Document management methods
  async uploadDocument(
    file: Express.Multer.File,
    projectId: number,
    uploadedBy: number,
  ) {
    const document = await this.prisma.projectDocument.create({
      data: {
        projectId,
        filename: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedBy,
      },
    });

    return document;
  }

  async getProjectDocuments(projectId: number) {
    return this.prisma.projectDocument.findMany({
      where: {
        projectId,
      },
      include: {
        uploader: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });
  }

  async deleteDocument(documentId: number, userId: number) {
    // First, get the document to check permissions and get file path
    const document = await this.prisma.projectDocument.findFirst({
      where: {
        id: documentId,
        project: {
          userId, // Ensure the user owns the project
        },
      },
    });

    if (!document) {
      throw new Error('Document not found or you do not have permission to delete it');
    }

    // Delete the file from filesystem
    try {
      if (fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    // Delete the record from database
    await this.prisma.projectDocument.delete({
      where: {
        id: documentId,
      },
    });

    return { message: 'Document deleted successfully' };
  }

  async downloadDocument(documentId: number, userId: number) {
    const document = await this.prisma.projectDocument.findFirst({
      where: {
        id: documentId,
        project: {
          userId, // Ensure the user owns the project
        },
      },
    });

    if (!document) {
      throw new Error('Document not found or you do not have permission to access it');
    }

    if (!fs.existsSync(document.filePath)) {
      throw new Error('File not found on server');
    }

    return {
      filePath: document.filePath,
      filename: document.filename,
      mimeType: document.mimeType,
    };
  }

  async getProjectById(id: number, userId: number) {
    return this.prisma.project.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        client: true,
        documents: {
          include: {
            uploader: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
          orderBy: {
            uploadedAt: 'desc',
          },
        },
      },
    });
  }
}

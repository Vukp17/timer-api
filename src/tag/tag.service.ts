import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Tag } from '@prisma/client';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class TagService {
  constructor(
    private prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async getTags(
    page: number,
    pageSize: number,
    userId: number,
    searchQuery?: string,
    sortField?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ items: Tag[]; total: number; page: number; pageSize: number }> {
    console.log(page, pageSize, userId, searchQuery, sortField, sortOrder);
    const searchConditions = searchQuery
      ? {
          OR: [{ name: { contains: searchQuery } }],
        }
      : {};

    const whereClause = {
      userId,
      ...searchConditions,
    };

    const total = await this.prisma.tag.count({
      where: whereClause,
    });

    const tags = await this.prisma.tag.findMany({
      where: whereClause,
      orderBy: this.commonService.getOrderBy(sortField, sortOrder),
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items: tags,
      total,
      page,
      pageSize,
    };
  }

  async getTagById(id: number): Promise<Tag | null> {
    return this.prisma.tag.findUnique({
      where: { id },
    });
  }

  async createTag(data: Prisma.TagCreateInput): Promise<Tag> {
    return this.prisma.tag.create({
      data,
    });
  }

  async updateTag(
    id: number,
    data: { name?: string; color?: string },
  ): Promise<Tag> {
    return this.prisma.tag.update({
      where: { id },
      data,
    });
  }

  async deleteTag(id: number): Promise<Tag> {
    return this.prisma.tag.delete({
      where: { id },
    });
  }
}

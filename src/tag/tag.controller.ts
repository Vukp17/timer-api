import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { AuthGuard, UserReq } from 'src/auth/auth.guard';
import { successResponse, errorResponse } from 'src/response';

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getTags(
    @Req() req: UserReq,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') searchQuery?: string,
    @Query('sortField') sortField?: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    try {
      const tags = await this.tagService.getTags(
        Number(page),
        Number(pageSize),
        req.user.sub,
        searchQuery,
        sortField,
        sortOrder,
      );
      return successResponse('Tags fetched successfully', tags);
    } catch (error) {
      return errorResponse('Failed to fetch tags', error);
    }
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getTagById(@Param('id') id: string) {
    try {
      const tag = await this.tagService.getTagById(Number(id));
      return successResponse('Tag fetched successfully', tag);
    } catch (error) {
      return errorResponse('Failed to fetch tag', error);
    }
  }

  @UseGuards(AuthGuard)
  @Post()
  async createTag(
    @Body() data: { name: string; color: string },
    @Req() req: UserReq,
  ) {
    try {
      const tag = await this.tagService.createTag({
        ...data,
        userId: req.user.sub,
      });
      return successResponse('Tag created successfully', tag);
    } catch (error) {
      return errorResponse('Failed to create tag', error);
    }
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async updateTag(
    @Param('id') id: string,
    @Body() data: { name?: string; color?: string },
  ) {
    try {
      const tag = await this.tagService.updateTag(Number(id), data);
      return successResponse('Tag updated successfully', tag);
    } catch (error) {
      return errorResponse('Failed to update tag', error);
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteTag(@Param('id') id: string) {
    try {
      await this.tagService.deleteTag(Number(id));
      return successResponse('Tag deleted successfully', {});
    } catch (error) {
      return errorResponse('Failed to delete tag', error);
    }
  }
}

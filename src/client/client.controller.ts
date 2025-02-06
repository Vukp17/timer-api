import { Body, Controller, Delete, Get, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, UserReq } from 'src/auth/auth.guard';
import { ClientService } from './client.service';
import { ClientCreateDto } from './dto/client-create.dto';
import { Client } from '@prisma/client';
import { successResponse, errorResponse } from 'src/response';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getUserClients(
    @Req() req: UserReq,
    @Query('search') searchQuery?: string,
    @Query('sortField') sortField?: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    try {
      const response = await this.clientService.getClientsForUser(
        Number(page),
        Number(pageSize),
        req.user.sub,
        searchQuery,
        sortField,
        sortOrder
      );
      return successResponse('Clients fetched successfully', response);
    } catch (error) {
      return errorResponse('Failed to fetch clients', error);
    }
  }

  @UseGuards(AuthGuard)
  @Post()
  async createClient(@Req() req: UserReq, @Body() data: ClientCreateDto) {
    try {
      const result = {
        ...data,
        user: {
          connect: { id: req.user.sub },
        },
      };
      const response = await this.clientService.createClient(result);
      return successResponse('Client created successfully', response);
    } catch (error) {
      return errorResponse('Failed to create client', error);
    }
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async updateClient(@Req() req: UserReq, @Body() data: Client) {
    try {
      const { id, userId, ...updateData } = data; // Destructure to exclude id
      const result = {
        ...updateData,
        user: {
          connect: { id: req.user.sub },
        },
      };
      const response = await this.clientService.updateClient(Number(req.params.id), result);
      return successResponse('Client updated successfully', response);
    } catch (error) {
      return errorResponse('Failed to update client', error);
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteClient(@Req() req: UserReq) {
    try {
      await this.clientService.deleteClient(Number(req.params.id));
      return successResponse('Client deleted successfully', {});
    } catch (error) {
      return errorResponse('Failed to delete client', error);
    }
  }

  @UseGuards(AuthGuard)
  @Get('all')
  async getAllClients(@Req() req: UserReq) {
    try {
      const response = await this.clientService.getAllClients(req.user.sub);
      return successResponse('All clients fetched successfully', response);
    } catch (error) {
      return errorResponse('Failed to fetch all clients', error);
    }
  }
}
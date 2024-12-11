import { Body, Controller, Delete, Get, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, UserReq } from 'src/auth/auth.guard';
import { ClientService } from './client.service';
import { ClientCreateDto } from './dto/client-create.dto';
import { Client } from '@prisma/client';

@Controller('client')
export class ClientController {
    constructor(private readonly clientService: ClientService) { }

    @UseGuards(AuthGuard)
    @Get(

    )
    async getUserClients(
        @Req() req: UserReq,
        @Query('search') searchQuery?: string,
        @Query('sortField') sortField?: string,
        @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc'
      ) {
        console.log(searchQuery, sortField, sortOrder);
        return this.clientService.getClientsForUser(req.user.sub,  searchQuery,sortField, sortOrder);
      }

    @UseGuards(AuthGuard)
    @Post()
    async createClient(@Req() req: UserReq, @Body() data: ClientCreateDto) {
        const result = {
            ...data,
            user: {
                connect: { id: req.user.sub }
            }
        }
        return this.clientService.createClient(result);
    }

    @UseGuards(AuthGuard)
    @Put(':id')
    async updateClient(@Req() req: UserReq, @Body() data: Client) {
        const { id, userId ,...updateData } = data; // Destructure to exclude id
        const result = {
          ...updateData,
          user: {
            connect: { id: req.user.sub },
          },
        };
        return this.clientService.updateClient(Number(req.params.id), result);
      }


    @UseGuards(AuthGuard)
    @Delete(':id')
    async deleteClient(@Req() req: UserReq) {
        return this.clientService.deleteClient(Number(req.params.id));
    }
}

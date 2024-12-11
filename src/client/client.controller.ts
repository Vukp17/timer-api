import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, UserReq } from 'src/auth/auth.guard';
import { ClientService } from './client.service';
import { ClientCreateDto } from './dto/client-create.dto';

@Controller('client')
export class ClientController {
    constructor(private readonly clientService: ClientService) { }

    @UseGuards(AuthGuard)
    @Get()
    async getUserClients(@Req() req: UserReq) {
        return this.clientService.getClientsForUser(req.user.sub);
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
}

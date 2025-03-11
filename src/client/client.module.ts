import { Module } from '@nestjs/common';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CommonService } from 'src/common/common.service';

@Module({
  controllers: [ClientController],
  providers: [ClientService, PrismaService, JwtService, CommonService],
})
export class ClientModule {}

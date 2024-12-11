import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
@Module({
  controllers: [ProjectController],
  providers: [ProjectService, PrismaService,JwtService],
  imports: [],
  
})
export class ProjectModule 

{}

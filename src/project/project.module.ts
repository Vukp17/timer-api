import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CommonService } from 'src/common/common.service';
@Module({
  controllers: [ProjectController],
  providers: [ProjectService, PrismaService,JwtService,CommonService],
  imports: [],
  
})
export class ProjectModule 

{}

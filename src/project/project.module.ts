import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CommonService } from 'src/common/common.service';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from '../common/file-upload.config';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService, PrismaService, JwtService, CommonService],
  imports: [MulterModule.register(multerConfig)],
})
export class ProjectModule {}

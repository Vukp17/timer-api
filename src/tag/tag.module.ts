import { Module } from '@nestjs/common';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CommonService } from 'src/common/common.service';
@Module({
  controllers: [TagController],
  providers: [TagService,PrismaService,JwtService,CommonService],
  exports: [TagService],
})
export class TagModule {} 
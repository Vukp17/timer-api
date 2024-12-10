import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [UserService,PrismaService], // Register UserService
  controllers: [UserController],
  exports: [UserService,PrismaService], // Export UserService for other modules
})
export class UserModule {}

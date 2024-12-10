import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [UserModule, AuthModule,
    ConfigModule.forRoot({
    envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, // Load .env files based on NODE_ENV
    isGlobal: true, // Make config globally available
  }),],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule { }

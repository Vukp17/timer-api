import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { ProjectModule } from './project/project.module';
import { ClientModule } from './client/client.module';
import { CommonService } from './common/common.service';
import { TimerModule } from './timer/timer.module';
import { TagModule } from './tag/tag.module';

@Module({
  imports: [UserModule, AuthModule,
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, // Load .env files based on NODE_ENV
      isGlobal: true, // Make config globally available
    }),
    ProjectModule,
    ClientModule,
    TimerModule,
    TagModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, CommonService,
  ],
  exports: [PrismaService],
})
export class AppModule { }

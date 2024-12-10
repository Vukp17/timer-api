import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module'; // Import UserModule
import { JwtModule } from '@nestjs/jwt'; // Ensure JWT module is imported
import { AuthController } from './auth.controller';

@Module({
  imports: [
    UserModule, // Import UserModule
    JwtModule.register({
      secret: 'your-secret-key', // Use a secure key or load from env
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}

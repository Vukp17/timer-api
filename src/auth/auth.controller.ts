import {
  Body,
  Controller,
  Get,

  Post,
  Request,
  UseGuards
} from '@nestjs/common'; import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard, UserReq } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: UserReq) {
    return req.user;
  }
}

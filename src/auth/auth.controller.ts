import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard, UserReq } from './auth.guard';
import { RefreshTokenGuard } from './refresh-token.guard';
import { UserService } from 'src/user/user.service';
import { errorResponse, successResponse } from 'src/response';
import { Prisma } from '@prisma/client';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private userService: UserService) { }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(dto);
    
    // Set refresh token in http-only cookie
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: true, // Use in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return access token in response body
    return {
      access_token: tokens.access_token,
    };
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Req() req: UserReq) {
    return req.user;
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(
    @Req() req: UserReq,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(req.user.sub);
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }


  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refreshTokens(
    @Req() req: UserReq,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user.sub;
    const refreshToken = req.cookies.refresh_token;
    
    const tokens = await this.authService.refreshTokens(userId, refreshToken);
    
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      access_token: tokens.access_token,
    };
  }
}

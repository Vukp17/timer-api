import { Controller, Get, Put, Req, UseGuards, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { UserReq } from 'src/auth/auth.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { successResponse } from 'src/response';
import { errorResponse } from 'src/response';
import { Prisma } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @UseGuards(AuthGuard)
  @Get('verify')
  async verify(@Req() req: UserReq) {
    return req.user;
  }

  @UseGuards(AuthGuard)
  @Get('curentUser')
  async getCurentUser(@Req() req: UserReq) {
    try {
      const user = await this.userService.getUserDetailsById(req.user.sub);
      return successResponse('User fetched successfully', user);
    } catch (error) {
      return errorResponse(error);
    }
  }

  @UseGuards(AuthGuard)
  @Put()
  async updateUser(@Req() req: UserReq, @Body() dto: Prisma.UserUpdateInput) {
    try {
      const user = await this.userService.update(req.user.sub, dto);
      return successResponse('User updated successfully', user);
    } catch (error) {
      return errorResponse(error);
    }
  }
}

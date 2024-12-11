// guards/global-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class GlobalAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const route = request.route.path;

    // Define your public routes here
    const publicRoutes = ['/auth/login', '/auth/register'];

    if (publicRoutes.includes(route)) {
      return true; // Allow access to public routes
    }

    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) {
      return false; // Reject if no Authorization header is present
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      return false; // Reject if token is not provided
    }

    // Optionally validate the token here (or let a JwtStrategy handle it)
    return true; // Allow access if the token exists
  }
}

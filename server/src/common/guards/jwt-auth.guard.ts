import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard — validates the Bearer JWT on every protected route.
 * Extends Passport's built-in JWT guard so we can use it as a class
 * (required for dependency injection and NestJS guard system).
 *
 * Usage: @UseGuards(JwtAuthGuard)
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

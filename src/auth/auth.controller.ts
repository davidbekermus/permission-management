import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   *
   * Simulates an OSS login: accepts a username (as if the external SSO
   * already validated the user), looks up the user in DB for their roles,
   * and issues a JWT.
   *
   * - User exists in DB → JWT carries their current roles.
   * - User NOT in DB   → JWT carries empty roles [].
   *
   * The user document is created only when a permission request is approved.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.username);
  }

  /**
   * POST /auth/seed
   *
   * Dev-only bootstrap endpoint.
   * Creates a "superadmin" user with ANOMALY_ADMIN role if it doesn't exist.
   * Use this once after starting the app to get an admin account.
   *
   * No authentication required — intended for initial setup only.
   */
  @Post('seed')
  @HttpCode(HttpStatus.OK)
  seed() {
    return this.authService.seedSuperAdmin();
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Role } from '../common/utils/roles.util';
import { JwtPayload } from './jwt.strategy';
import { SEED_ADMIN_USERNAME } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Simulates an OSS (external single sign-on) login.
   *
   * Flow:
   *  1. Accept the username as if it was already validated by an external OSS.
   *  2. Look up the user in our DB to retrieve their current roles.
   *  3. Issue a JWT:
   *     - If user is in DB → payload carries their current roles.
   *     - If user is NOT in DB → payload carries empty roles [].
   *
   * sub is always the username string — consistent regardless of DB state.
   * The user document is NOT created here. It is created only when a
   * permission request is approved (see PermissionRequestsService).
   */
  async login(username: string): Promise<{ access_token: string }> {
    let payload: JwtPayload;

    try {
      const user = await this.usersService.findByUsername(username);
      payload = {
        sub: user.username,
        username: user.username,
        roles: user.roles,
      };
    } catch (e) {
      if (!(e instanceof NotFoundException)) throw e;
      // User not in DB yet — issue token with empty roles so they can
      // access permission-request endpoints.
      payload = {
        sub: username,
        username,
        roles: [] as Role[],
      };
    }

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Dev-only seed: creates a ANOMALY_ADMIN user named "superadmin" if none exists.
   * Call POST /auth/seed once to bootstrap the system.
   */
  async seedSuperAdmin(): Promise<{ message: string }> {
    try {
      await this.usersService.findByUsername(SEED_ADMIN_USERNAME);
      return { message: `${SEED_ADMIN_USERNAME} already exists` };
    } catch (e) {
      if (!(e instanceof NotFoundException)) throw e;
    }

    await this.usersService.createUser(SEED_ADMIN_USERNAME, [Role.ANOMALY_ADMIN]);
    return { message: `${SEED_ADMIN_USERNAME} created with ANOMALY_ADMIN role` };
  }
}

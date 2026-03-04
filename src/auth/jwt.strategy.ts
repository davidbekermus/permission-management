import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '../common/utils/roles.util';

export interface JwtPayload {
  /** User's DB _id, or the username string if user not yet in DB */
  sub: string;
  username: string;
  roles: Role[];
}

/**
 * JwtStrategy — validates incoming Bearer tokens and attaches the decoded
 * payload to request.user.
 *
 * The validate() method is the last step: passport calls it after verifying
 * the token signature and expiry. Whatever we return here becomes request.user.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'change-me-in-production',
    });
  }

  /**
   * Called after token signature validation.
   * We pass the payload through as-is — roles are already embedded in the JWT.
   */
  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}

import { Request } from 'express';
import { JwtPayload } from '../../auth/jwt.strategy';

/**
 * Typed HTTP request after JwtAuthGuard has validated the token.
 * `user` is the decoded JWT payload — username + roles, no DB lookup.
 */
export interface AuthedRequest extends Request {
  user: JwtPayload;
}

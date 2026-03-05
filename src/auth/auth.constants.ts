/** JWT secret — must be set via JWT_SECRET env var. Falls back to a dev-only default if not set. */
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
export const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

/** JWT token lifetime. */
export const JWT_EXPIRES_IN = '8h';

/** Username of the bootstrapped super-admin created by POST /auth/seed. */
export const SEED_ADMIN_USERNAME = 'superadmin';

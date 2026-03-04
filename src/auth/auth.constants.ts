/** JWT secret — override via JWT_SECRET env var in production. */
export const JWT_SECRET = process.env.JWT_SECRET ?? 'change-me-in-production';

/** JWT token lifetime. */
export const JWT_EXPIRES_IN = '8h';

/** Username of the bootstrapped super-admin created by POST /auth/seed. */
export const SEED_ADMIN_USERNAME = 'superadmin';

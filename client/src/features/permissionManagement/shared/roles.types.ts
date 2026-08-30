export enum Roles {
  ANOMALY_ADMIN = 'ANOMALY_ADMIN',
  STORE_ADMIN = 'STORE_ADMIN',
  STORE_USER = 'STORE_USER',
  PRODUCT_ADMIN = 'PRODUCT_ADMIN',
  PRODUCT_USER = 'PRODUCT_USER',
}

export type Role = Roles

export const ALL_ROLES: Role[] = Object.values(Roles)

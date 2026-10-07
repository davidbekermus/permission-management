// Controls table sort direction. Maps to asc/desc on the server.
export type SortOrder = 'latest' | 'oldest'

export enum Roles {
  ANOMALY_ADMIN = 'ANOMALY_ADMIN',
  STORE_ADMIN = 'STORE_ADMIN',
  STORE_USER = 'STORE_USER',
  PRODUCT_ADMIN = 'PRODUCT_ADMIN',
  PRODUCT_USER = 'PRODUCT_USER',
}

export const ALL_ROLES: Roles[] = Object.values(Roles)

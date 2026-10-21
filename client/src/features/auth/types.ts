import type { Roles } from "@/features/permissionManagement/permissionManagementUi/shared/types";

export interface JwtPayload {
  sub: string;
  username: string;
  roles: Roles[];
  iat: number;
  exp: number;
}

export interface LoginResponse {
  access_token: string;
}

import { apiClient } from '@/app/api/axiosClient'
import type { Role } from '@/features/auth/types'
import type { PermissionRequest } from './types'

export const permissionRequestsApi = {
  getAll: async (): Promise<PermissionRequest[]> => {
    const { data } = await apiClient.get<PermissionRequest[]>('/permission-requests')
    return data
  },

  getMine: async (): Promise<PermissionRequest[]> => {
    const { data } = await apiClient.get<PermissionRequest[]>('/permission-requests/my-requests')
    return data
  },

  create: async (roles: Role[]): Promise<PermissionRequest> => {
    const { data } = await apiClient.post<PermissionRequest>('/permission-requests', { roles })
    return data
  },

  approve: async (id: string, roles: Role[]): Promise<PermissionRequest> => {
    const { data } = await apiClient.patch<PermissionRequest>(
      `/permission-requests/${id}/approve`,
      { roles },
    )
    return data
  },

  reject: async (id: string, roles: Role[]): Promise<PermissionRequest> => {
    const { data } = await apiClient.patch<PermissionRequest>(
      `/permission-requests/${id}/reject`,
      { roles },
    )
    return data
  },
}

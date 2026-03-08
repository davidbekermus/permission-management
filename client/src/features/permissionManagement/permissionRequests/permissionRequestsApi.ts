import { apiClient } from '@/app/api/axiosClient'
import type { Role } from '@/features/auth/types'
import type { PermissionRequest, OverallStatus } from './types'

export interface RequestFilters {
  search?: string
  statuses?: OverallStatus[]
  roles?: Role[]
  sort?: 'latest' | 'oldest'
}

function buildParams(filters: RequestFilters, includeSearch = true) {
  const { search, statuses, roles, sort } = filters
  return {
    ...(includeSearch && search ? { username: search } : {}),
    ...(statuses?.length ? { statuses: statuses.join(',') } : {}),
    ...(roles?.length ? { roles: roles.join(',') } : {}),
    ...(sort ? { sort: sort === 'oldest' ? 'asc' : 'desc' } : {}),
  }
}

export const permissionRequestsApi = {
  getAll: async (filters: RequestFilters = {}): Promise<PermissionRequest[]> => {
    const { data } = await apiClient.get<PermissionRequest[]>('/permission-requests', {
      params: buildParams(filters, true),
    })
    return data
  },

  getMine: async (filters: RequestFilters = {}): Promise<PermissionRequest[]> => {
    const { data } = await apiClient.get<PermissionRequest[]>('/permission-requests/my-requests', {
      params: buildParams(filters, false),
    })
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

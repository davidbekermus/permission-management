import { apiClient } from '@/app/api/axiosClient'
import type { Role } from '@/features/auth/types'
import type { PermissionRequest, OverallStatus } from '../types'

export interface RequestFilters {
  search?: string
  statuses?: OverallStatus[]
  roles?: Role[]
  sort?: 'latest' | 'oldest'
}

// Converts filter state to query params. Search is excluded for /my-requests
// because that endpoint already scopes results to the current user.
function buildParams(filters: RequestFilters, includeSearch = true) {
  const { search, statuses, roles, sort } = filters
  return {
    ...(includeSearch && search ? { username: search } : {}),
    ...(statuses?.length ? { statuses: statuses.join(',') } : {}),
    ...(roles?.length ? { roles: roles.join(',') } : {}),
    ...(sort ? { sort: sort === 'oldest' ? 'asc' : 'desc' } : {}),
  }
}

const BASE = '/permission-requests'

export const permissionRequestsApi = {
  getAll: async (filters: RequestFilters = {}): Promise<PermissionRequest[]> => {
    const { data } = await apiClient.get<PermissionRequest[]>(BASE, {
      params: buildParams(filters, true),
    })
    return data
  },

  getMine: async (filters: RequestFilters = {}): Promise<PermissionRequest[]> => {
    const { data } = await apiClient.get<PermissionRequest[]>(`${BASE}/my-requests`, {
      params: buildParams(filters, false),
    })
    return data
  },

  create: async (roles: Role[]): Promise<PermissionRequest> => {
    const { data } = await apiClient.post<PermissionRequest>(BASE, { roles })
    return data
  },

  approve: async (id: string, roles: Role[]): Promise<PermissionRequest> => {
    const { data } = await apiClient.patch<PermissionRequest>(
      `${BASE}/${id}/approve`,
      { roles },
    )
    return data
  },

  reject: async (id: string, roles: Role[]): Promise<PermissionRequest> => {
    const { data } = await apiClient.patch<PermissionRequest>(
      `${BASE}/${id}/reject`,
      { roles },
    )
    return data
  },
}

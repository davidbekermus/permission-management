import { apiClient } from '@/app/api/axiosClient'
import type { Roles } from '../../shared/types'
import type { RoleSubmission, RoleSubmissionStatus } from '../types'

export interface RoleSubmissionFilters {
  search?: string
  statuses?: RoleSubmissionStatus[]
  roles?: Roles[]
  sort?: 'latest' | 'oldest'
}

function buildParams(filters: RoleSubmissionFilters, includeSearch = true) {
  const { search, statuses, roles, sort } = filters
  return {
    ...(includeSearch && search ? { username: search } : {}),
    ...(statuses?.length ? { statuses: statuses.join(',') } : {}),
    ...(roles?.length ? { roles: roles.join(',') } : {}),
    ...(sort ? { sort: sort === 'oldest' ? 'asc' : 'desc' } : {}),
  }
}

const BASE = '/role-submissions'

export const roleSubmissionsApi = {
  getAll: async (filters: RoleSubmissionFilters = {}): Promise<RoleSubmission[]> => {
    const { data } = await apiClient.get<RoleSubmission[]>(BASE, {
      params: buildParams(filters, true),
    })
    return data
  },

  getMine: async (filters: RoleSubmissionFilters = {}): Promise<RoleSubmission[]> => {
    const { data } = await apiClient.get<RoleSubmission[]>(`${BASE}/my-submissions`, {
      params: buildParams(filters, false),
    })
    return data
  },

  create: async (roles: Roles[]): Promise<RoleSubmission[]> => {
    const { data } = await apiClient.post<RoleSubmission[]>(BASE, { roles })
    return data
  },

  approve: async (id: string): Promise<RoleSubmission> => {
    const { data } = await apiClient.patch<RoleSubmission>(`${BASE}/${id}/approve`)
    return data
  },

  reject: async (id: string): Promise<RoleSubmission> => {
    const { data } = await apiClient.patch<RoleSubmission>(`${BASE}/${id}/reject`)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`)
  },
}

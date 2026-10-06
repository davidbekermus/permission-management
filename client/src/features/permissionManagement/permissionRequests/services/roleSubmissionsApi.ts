import { apiClient } from '@/app/api/axiosClient'
import type { Roles } from '../../shared/types'
import type {
  RoleSubmission,
  RoleSubmissionAction,
  RoleSubmissionStatus,
} from '../types'

export interface RoleSubmissionFilters {
  search?: string
  statuses?: RoleSubmissionStatus[]
  roles?: Roles[]
  sort?: 'latest' | 'oldest'
}

function buildParams(filters: Omit<RoleSubmissionFilters, 'search'>) {
  const { statuses, roles, sort } = filters
  return {
    ...(statuses?.length ? { statuses: statuses.join(',') } : {}),
    ...(roles?.length ? { roles: roles.join(',') } : {}),
    ...(sort ? { sort: sort === 'oldest' ? 'asc' : 'desc' } : {}),
  }
}

const BASE = '/role-submissions'

export const roleSubmissionsApi = {
  getAll: async (filters: RoleSubmissionFilters = {}): Promise<RoleSubmission[]> => {
    const { data } = await apiClient.get<RoleSubmission[]>(BASE, {
      params: {
        ...buildParams(filters),
        ...(filters.search ? { username: filters.search } : {}),
      },
    })
    return data
  },

  getMine: async (filters: Omit<RoleSubmissionFilters, 'search'> = {}): Promise<RoleSubmission[]> => {
    const { data } = await apiClient.get<RoleSubmission[]>(`${BASE}/my-submissions`, {
      params: buildParams(filters),
    })
    return data
  },

  create: async (roles: Roles[], action: RoleSubmissionAction): Promise<RoleSubmission[]> => {
    const { data } = await apiClient.post<RoleSubmission[]>(BASE, { roles, action })
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

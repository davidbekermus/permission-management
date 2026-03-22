import { apiClient } from '@/app/api/axiosClient'
import type { Role } from '@/features/auth/types'
import type { User } from '../types'

export interface UserFilters {
  search?: string
  roles?: Role[]
  sort?: 'latest' | 'oldest'
}

const BASE = '/users'

export const usersApi = {
  getUsers: async (filters: UserFilters = {}): Promise<User[]> => {
    const { search, roles, sort } = filters
    const { data } = await apiClient.get<User[]>(BASE, {
      params: {
        ...(search ? { username: search } : {}),
        ...(roles?.length ? { roles: roles.join(',') } : {}),
        ...(sort ? { sort: sort === 'oldest' ? 'asc' : 'desc' } : {}),
      },
    })
    return data
  },

  assignRole: async (username: string, role: Role): Promise<User> => {
    const { data } = await apiClient.patch<User>(`${BASE}/${username}/roles`, { role })
    return data
  },

  removeRole: async (username: string, role: Role): Promise<User> => {
    const { data } = await apiClient.delete<User>(`${BASE}/${username}/roles/${role}`)
    return data
  },

  createUser: async (username: string, roles: Role[]): Promise<User> => {
    const { data } = await apiClient.post<User>(BASE, { username, roles })
    return data
  },
}

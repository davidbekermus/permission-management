import { apiClient } from '@/app/api/axiosClient'
import type { Roles, SortOrder } from '../../../permissionManagement/shared/types'
import type { User } from '../../../permissionManagement/users/types'

export interface UserFilters {
  search?: string
  roles?: Roles[]
  sort?: SortOrder
}

const BASE = '/users'

export const usersApi = {
  getUsers: async (filters: UserFilters = {}, offset = 0): Promise<User[]> => {
    const { search, roles, sort } = filters
    const { data } = await apiClient.get<User[]>(BASE, {
      params: {
        offset,
        ...(search ? { username: search } : {}),
        ...(roles?.length ? { roles: roles.join(',') } : {}),
        ...(sort ? { sort: sort === 'oldest' ? 'asc' : 'desc' } : {}),
      },
    })
    return data
  },

  assignRole: async (username: string, role: Roles): Promise<User> => {
    const { data } = await apiClient.patch<User>(`${BASE}/${encodeURIComponent(username)}/roles`, { role })
    return data
  },

  removeRole: async (username: string, role: Roles): Promise<User> => {
    const { data } = await apiClient.delete<User>(`${BASE}/${encodeURIComponent(username)}/roles/${role}`)
    return data
  },

  createUsers: async (usernames: string[], roles: Roles[]): Promise<User[]> => {
    const { data } = await apiClient.post<User[]>(BASE, { usernames, roles })
    return data
  },
}

import { apiClient } from '@/app/api/axiosClient'
import type { Role } from '@/features/auth/types'
import type { User } from './types'

export const usersApi = {
  getUsers: async (username?: string): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>('/users', {
      params: username ? { username } : undefined,
    })
    return data
  },

  assignRole: async (username: string, role: Role): Promise<User> => {
    const { data } = await apiClient.patch<User>(`/users/${username}/roles`, { role })
    return data
  },

  removeRole: async (username: string, role: Role): Promise<User> => {
    const { data } = await apiClient.delete<User>(`/users/${username}/roles/${role}`)
    return data
  },
}

import { apiClient } from '@/app/api/axiosClient'
import type { LoginResponse } from './types'

export const authApi = {
  login: async (username: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', { username })
    return data
  },
}

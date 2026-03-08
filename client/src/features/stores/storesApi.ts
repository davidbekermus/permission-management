import { apiClient } from '@/app/api/axiosClient'
import type { StoreItem, CreateStoreItemDto } from './types'

export const storesApi = {
  getItems: async (): Promise<StoreItem[]> => {
    const { data } = await apiClient.get<StoreItem[]>('/store/items')
    return data
  },

  createItem: async (dto: CreateStoreItemDto): Promise<StoreItem> => {
    const { data } = await apiClient.post<StoreItem>('/store/items', dto)
    return data
  },

  deleteItem: async (id: number): Promise<void> => {
    await apiClient.delete(`/store/items/${id}`)
  },
}

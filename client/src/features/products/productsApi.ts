import { apiClient } from '@/app/api/axiosClient'
import type { Product, CreateProductDto } from './types'

export const productsApi = {
  getProducts: async (): Promise<Product[]> => {
    const { data } = await apiClient.get<Product[]>('/products')
    return data
  },

  createProduct: async (dto: CreateProductDto): Promise<Product> => {
    const { data } = await apiClient.post<Product>('/products', dto)
    return data
  },

  deleteProduct: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}`)
  },
}

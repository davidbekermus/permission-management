import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from './productsApi'
import type { CreateProductDto } from './types'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getProducts,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateProductDto) => productsApi.createProduct(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => productsApi.deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { storesApi } from './storesApi'
import type { CreateStoreItemDto } from './types'

export function useStoreItems() {
  return useQuery({
    queryKey: ['storeItems'],
    queryFn: storesApi.getItems,
  })
}

export function useCreateStoreItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateStoreItemDto) => storesApi.createItem(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storeItems'] }),
  })
}

export function useDeleteStoreItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => storesApi.deleteItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storeItems'] }),
  })
}

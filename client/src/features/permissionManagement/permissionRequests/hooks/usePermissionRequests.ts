import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { permissionRequestsApi, type RequestFilters } from '../services/permissionRequestsApi'
import type { Role } from '@/features/auth/types'

const permissionRequestsKey = 'permissionRequests'

export function useAllPermissionRequests(filters: RequestFilters = {}, enabled = true) {
  return useQuery({
    queryKey: [permissionRequestsKey, 'all', filters],
    queryFn: () => permissionRequestsApi.getAll(filters),
    enabled,
  })
}

export function useMyPermissionRequests(filters: RequestFilters = {}, enabled = true) {
  return useQuery({
    queryKey: [permissionRequestsKey, 'mine', filters],
    queryFn: () => permissionRequestsApi.getMine(filters),
    enabled,
  })
}

export function useCreatePermissionRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roles: Role[]) => permissionRequestsApi.create(roles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [permissionRequestsKey] })
    },
  })
}

export function useApproveRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: Role[] }) =>
      permissionRequestsApi.approve(id, roles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [permissionRequestsKey] })
    },
  })
}

export function useRejectRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: Role[] }) =>
      permissionRequestsApi.reject(id, roles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [permissionRequestsKey] })
    },
  })
}

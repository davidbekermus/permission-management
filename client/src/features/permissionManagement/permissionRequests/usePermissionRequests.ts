import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { permissionRequestsApi, type RequestFilters } from './permissionRequestsApi'
import type { Role } from '@/features/auth/types'

export function useAllPermissionRequests(filters: RequestFilters = {}) {
  return useQuery({
    queryKey: ['permissionRequests', 'all', filters],
    queryFn: () => permissionRequestsApi.getAll(filters),
  })
}

export function useMyPermissionRequests(filters: RequestFilters = {}) {
  return useQuery({
    queryKey: ['permissionRequests', 'mine', filters],
    queryFn: () => permissionRequestsApi.getMine(filters),
  })
}

export function useCreatePermissionRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roles: Role[]) => permissionRequestsApi.create(roles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissionRequests'] })
    },
  })
}

export function useApproveRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: Role[] }) =>
      permissionRequestsApi.approve(id, roles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissionRequests'] })
    },
  })
}

export function useRejectRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: Role[] }) =>
      permissionRequestsApi.reject(id, roles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissionRequests'] })
    },
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { permissionRequestsApi } from './permissionRequestsApi'
import type { Role } from '@/features/auth/types'

export function useAllPermissionRequests() {
  return useQuery({
    queryKey: ['permissionRequests', 'all'],
    queryFn: permissionRequestsApi.getAll,
  })
}

export function useMyPermissionRequests() {
  return useQuery({
    queryKey: ['permissionRequests', 'mine'],
    queryFn: permissionRequestsApi.getMine,
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

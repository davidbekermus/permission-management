import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from './usersApi'
import type { Role } from '@/features/auth/types'

export function useUsers(search?: string) {
  return useQuery({
    queryKey: ['users', search ?? ''],
    queryFn: () => usersApi.getUsers(search || undefined),
  })
}

export function useAssignRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ username, role }: { username: string; role: Role }) =>
      usersApi.assignRole(username, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useRemoveRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ username, role }: { username: string; role: Role }) =>
      usersApi.removeRole(username, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

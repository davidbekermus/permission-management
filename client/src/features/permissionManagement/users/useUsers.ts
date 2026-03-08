import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi, type UserFilters } from './usersApi'
import type { Role } from '@/features/auth/types'

export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => usersApi.getUsers(filters),
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

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ username, roles }: { username: string; roles: Role[] }) =>
      usersApi.createUser(username, roles),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

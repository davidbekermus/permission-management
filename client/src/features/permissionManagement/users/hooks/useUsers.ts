import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi, type UserFilters } from '../services/usersApi'
import type { Roles } from '../../shared/types'

const usersKey = 'users'

export function useGetUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: [usersKey, filters],
    queryFn: () => usersApi.getUsers(filters),
  })
}

export function useAssignRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ username, role }: { username: string; role: Roles }) =>
      usersApi.assignRole(username, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [usersKey] }),
  })
}

export function useRemoveRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ username, role }: { username: string; role: Roles }) =>
      usersApi.removeRole(username, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [usersKey] }),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ username, roles }: { username: string; roles: Roles[] }) =>
      usersApi.createUser(username, roles),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [usersKey] }),
  })
}

export function useCreateUsers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ usernames, roles }: { usernames: string[]; roles: Roles[] }) =>
      usersApi.createUsers(usernames, roles),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [usersKey] }),
  })
}

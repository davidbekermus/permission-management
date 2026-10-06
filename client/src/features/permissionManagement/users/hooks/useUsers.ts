import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCurrentUsername } from '@/app/auth/auth.utils'
import { usersApi, type UserFilters } from '../services/usersApi'
import type { Roles } from '../../shared/types'

const usersKey = 'users'

export function useGetUsers(filters: UserFilters = {}) {
  const username = getCurrentUsername()
  return useQuery({
    queryKey: [usersKey, username, filters],
    queryFn: () => usersApi.getUsers(filters),
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === username ? keepPreviousData(previousData) : undefined,
  })
}

export function useAssignRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ username, role }: { username: string; role: Roles }) =>
      usersApi.assignRole(username, role),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: [usersKey] }),
      queryClient.invalidateQueries({ queryKey: ['roleSubmissions'] }),
    ]),
  })
}

export function useRemoveRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ username, role }: { username: string; role: Roles }) =>
      usersApi.removeRole(username, role),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: [usersKey] }),
      queryClient.invalidateQueries({ queryKey: ['roleSubmissions'] }),
    ]),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ username, roles }: { username: string; roles: Roles[] }) =>
      usersApi.createUser(username, roles),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: [usersKey] }),
      queryClient.invalidateQueries({ queryKey: ['roleSubmissions'] }),
    ]),
  })
}

export function useCreateUsers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ usernames, roles }: { usernames: string[]; roles: Roles[] }) =>
      usersApi.createUsers(usernames, roles),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: [usersKey] }),
      queryClient.invalidateQueries({ queryKey: ['roleSubmissions'] }),
    ]),
  })
}

import { keepPreviousData, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCurrentUsername } from '@/app/auth/auth.utils'
import { roleSubmissionsApi, type RoleSubmissionFilters } from '../services/roleSubmissionsApi'
import type { Roles } from '../../shared/types'
import type { RoleSubmissionAction, RoleSubmissionScope } from '../types'

const roleSubmissionsKey = 'roleSubmissions'

export type { RoleSubmissionScope } from '../types'

export function useGetRoleSubmissions(filters: RoleSubmissionFilters, scope: RoleSubmissionScope) {
  const username = getCurrentUsername()
  const { statuses, roles, sort } = filters
  const scopedFilters = scope === 'review' ? filters : { statuses, roles, sort }

  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: [roleSubmissionsKey, username, scope, scopedFilters],
    queryFn: ({ pageParam }) => scope === 'review'
      ? roleSubmissionsApi.getAll(scopedFilters, pageParam)
      : roleSubmissionsApi.getMine(scopedFilters, pageParam),
    getNextPageParam: (lastPage, pages) => lastPage.length === 20
      ? pages.reduce((total, page) => total + page.length, 0)
      : undefined,
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === username && previousQuery.queryKey[2] === scope
        ? keepPreviousData(previousData)
        : undefined,
  })
}

export function useCreateRoleSubmission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ roles, action }: { roles: Roles[]; action: RoleSubmissionAction }) =>
      roleSubmissionsApi.create(roles, action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [roleSubmissionsKey] }),
  })
}

export function useApproveRoleSubmission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => roleSubmissionsApi.approve(id),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: [roleSubmissionsKey] }),
      queryClient.invalidateQueries({ queryKey: ['users'] }),
    ]),
  })
}

export function useRejectRoleSubmission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => roleSubmissionsApi.reject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [roleSubmissionsKey] }),
  })
}

export function useDeleteRoleSubmission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => roleSubmissionsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [roleSubmissionsKey] }),
  })
}

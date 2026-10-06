import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roleSubmissionsApi, type RoleSubmissionFilters } from '../services/roleSubmissionsApi'
import type { Roles } from '../../shared/types'
import type { RoleSubmissionAction } from '../types'

const roleSubmissionsKey = 'roleSubmissions'

export type RoleSubmissionScope = 'review' | 'mine'

export function useGetRoleSubmissions(filters: RoleSubmissionFilters, scope: RoleSubmissionScope) {
  return useQuery({
    queryKey: [roleSubmissionsKey, scope, filters],
    queryFn: () => scope === 'review'
      ? roleSubmissionsApi.getAll(filters)
      : roleSubmissionsApi.getMine(filters),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [roleSubmissionsKey] }),
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

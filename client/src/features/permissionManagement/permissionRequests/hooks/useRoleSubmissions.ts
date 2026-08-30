import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roleSubmissionsApi, type RoleSubmissionFilters } from '../services/roleSubmissionsApi'
import type { Roles } from '../../shared/types'

const roleSubmissionsKey = 'roleSubmissions'

export function useAllRoleSubmissions(filters: RoleSubmissionFilters = {}, enabled = true) {
  return useQuery({
    queryKey: [roleSubmissionsKey, 'all', filters],
    queryFn: () => roleSubmissionsApi.getAll(filters),
    enabled,
  })
}

export function useMyRoleSubmissions(filters: RoleSubmissionFilters = {}, enabled = true) {
  return useQuery({
    queryKey: [roleSubmissionsKey, 'mine', filters],
    queryFn: () => roleSubmissionsApi.getMine(filters),
    enabled,
  })
}

export function useCreateRoleSubmission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roles: Roles[]) => roleSubmissionsApi.create(roles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [roleSubmissionsKey] })
    },
  })
}

export function useApproveRoleSubmission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => roleSubmissionsApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [roleSubmissionsKey] })
    },
  })
}

export function useRejectRoleSubmission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => roleSubmissionsApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [roleSubmissionsKey] })
    },
  })
}

export function useDeleteRoleSubmission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => roleSubmissionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [roleSubmissionsKey] })
    },
  })
}

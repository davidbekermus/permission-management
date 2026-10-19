import { useState } from 'react'
import { useSnackbar } from 'notistack'
import { canManagePermissions, getRolesInAdminScope } from '@/app/auth/auth.utils'
import { useGetUsers, useAssignRole, useRemoveRole, useCreateUsers } from './useUsers'
import { useDebounce } from '../../hooks/useDebounce'
import { filterRequestableRoles } from '../../shared/role.utils'
import { Roles, type SortOrder } from '../../shared/types'

/** Host integration point for users: queries, mutations, auth and notifications. */
export function useUsersView() {
  const isAnomalyAdmin = canManagePermissions()
  const [search, setSearch] = useState('')
  const [roles, setRoles] = useState<Roles[]>([])
  const [sort, setSort] = useState<SortOrder>('latest')
  const [addUserOpen, setAddUserOpen] = useState(false)
  const debouncedSearch = useDebounce(search, 300)
  const filterCount = roles.length + (sort !== 'latest' ? 1 : 0)
  const manageableRoles = getRolesInAdminScope()
  const query = useGetUsers({ search: debouncedSearch, roles, sort })
  const rows = (query.data?.pages.flat() ?? []).map((user) => {
    const heldRoles = user.roles.map((entry) => entry.role)
    const availableRoles = filterRequestableRoles(manageableRoles, heldRoles)
    return {
      user,
      availableRoles,
      hasHighestAccess: heldRoles.includes(Roles.ANOMALY_ADMIN),
      canManageRoles: availableRoles.length > 0 || heldRoles.length > 0,
    }
  })
  const assignRole = useAssignRole()
  const removeRole = useRemoveRole()
  const createUsers = useCreateUsers()
  const { enqueueSnackbar } = useSnackbar()

  const handleAssignRole = async (username: string, role: Roles) => {
    try {
      await assignRole.mutateAsync({ username, role })
      enqueueSnackbar('Role assigned', { variant: 'success' })
      return true
    } catch {
      enqueueSnackbar('Failed to assign role', { variant: 'error' })
      return false
    }
  }

  const handleRemoveRole = async (username: string, role: Roles) => {
    try {
      await removeRole.mutateAsync({ username, role })
      enqueueSnackbar('Role removed', { variant: 'success' })
      return true
    } catch {
      enqueueSnackbar('Failed to remove role', { variant: 'error' })
      return false
    }
  }

  const handleCreateUsers = async (usernames: string[], roles: Roles[]) => {
    try {
      const createdUsers = await createUsers.mutateAsync({ usernames, roles })
      const skippedCount = usernames.length - createdUsers.length
      const message = skippedCount > 0
        ? `${createdUsers.length} created, ${skippedCount} existing ${skippedCount === 1 ? 'user was' : 'users were'} skipped`
        : `${createdUsers.length} ${createdUsers.length === 1 ? 'user' : 'users'} created successfully`
      enqueueSnackbar(message, { variant: createdUsers.length > 0 ? 'success' : 'info' })
      return true
    } catch {
      enqueueSnackbar('Failed to create users.', { variant: 'error' })
      return false
    }
  }

  return {
    canManage: isAnomalyAdmin,
    openAddUser: () => setAddUserOpen(true),
    filters: {
      search,
      onSearchChange: setSearch,
      filterCount,
      appliedRoles: roles,
      appliedSort: sort,
      roleOptions: manageableRoles,
      onApply: (selectedRoles: Roles[], selectedSort: SortOrder) => {
        setRoles(selectedRoles)
        setSort(selectedSort)
      },
    },
    table: {
      rows,
      canManage: isAnomalyAdmin,
      isLoading: query.isLoading && !query.data,
      isError: query.isError && !query.data,
      isAssigning: assignRole.isPending,
      isRemoving: removeRole.isPending,
      onAssignRole: handleAssignRole,
      onRemoveRole: handleRemoveRole,
      pagination: {
        hasNextPage: query.hasNextPage,
        isFetching: query.isFetching,
        isError: query.isFetchNextPageError,
        enabled: !query.isPlaceholderData,
        onLoadMore: query.fetchNextPage,
      },
    },
    addUserDialog: {
      open: addUserOpen,
      onClose: () => {
        createUsers.reset()
        setAddUserOpen(false)
      },
      availableRoles: manageableRoles,
      isPending: createUsers.isPending,
      onSubmit: handleCreateUsers,
    },
  }
}

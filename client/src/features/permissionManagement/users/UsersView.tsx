import { createPortal } from 'react-dom'
import Button from '@mui/material/Button'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { UsersTable } from './table/UsersTable'
import { AddUserDialog } from './AddUserDialog'
import { SearchAndFilterControls } from '../shared/SearchAndFilterControls'
import { useUsersView } from './hooks/useUsersView'

interface UsersViewProps {
  toolbarContainer: HTMLDivElement | null
}

export const UsersView = ({ toolbarContainer }: UsersViewProps) => {
  const view = useUsersView()
  const toolbarActions = (
    <>
      <SearchAndFilterControls dialogTitle="Filter Users" {...view.filters} />
      {view.canManage && (
        <Button color="secondary"
          variant="contained"
          size="small"
          startIcon={<PersonAddIcon fontSize="small" />}
          onClick={view.openAddUser}
        >
          Add user
        </Button>
      )}
    </>
  )

  return (
    <>
      {toolbarContainer && createPortal(toolbarActions, toolbarContainer)}
      <UsersTable {...view.table} />
      <AddUserDialog {...view.addUserDialog} />
    </>
  )
}

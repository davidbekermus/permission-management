import { PageWrapper, FormRow, UnauthorizedContent, UnauthorizedIcon, PriceField, EmptyMessage } from './StoresPage.style'
import { useState } from 'react'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import DeleteIcon from '@mui/icons-material/Delete'
import { useStoreItems, useCreateStoreItem, useDeleteStoreItem } from './useStores'
import { getCurrentRoles, isFlowAdmin } from '@/app/auth/auth.utils'
import { Roles } from '@/features/permissionManagement/shared/types'



export const StoresPage = () => {
  const roles = getCurrentRoles()
  const hasAccess = isFlowAdmin('STORE') || roles.includes(Roles.STORE_USER)
  const isAdmin = isFlowAdmin('STORE')

  if (!hasAccess) {
    return (
      <PageWrapper>
        <UnauthorizedContent>
          <UnauthorizedIcon />
          <Typography variant="h6" color="text.secondary">Unauthorized</Typography>
          <Typography variant="body2" color="text.disabled">
            You don't have permission to access Store Management.
          </Typography>
        </UnauthorizedContent>
      </PageWrapper>
    )
  }
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  const { data: items = [], isLoading, isError } = useStoreItems()
  const createItem = useCreateStoreItem()
  const deleteItem = useDeleteStoreItem()

  const handleCreate = () => {
    if (!name.trim() || isNaN(Number(price))) return
    createItem.mutate(
      { name: name.trim(), price: Number(price) },
      { onSuccess: () => { setName(''); setPrice('') } },
    )
  }

  return (
    <PageWrapper>
      <Typography variant="h5" gutterBottom>
        Store Items
      </Typography>

      {isAdmin && (
        <FormRow>
          <TextField
            label="Item name"
            size="small"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <PriceField
            label="Price"
            size="small"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <Button
            color="secondary"
            variant="contained"
            disabled={!name.trim() || !price || createItem.isPending}
            onClick={handleCreate}
            startIcon={createItem.isPending ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Add item
          </Button>
        </FormRow>
      )}

      {isLoading && <CircularProgress size={24} />}
      {isError && <Alert severity="error">Failed to load store items. You may not have access.</Alert>}

      {!isLoading && !isError && (
        <TableContainer component={Paper} elevation={0} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Description</TableCell>
                {isAdmin && <TableCell />}
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 4 : 3}>
                    <EmptyMessage variant="body2" color="text.secondary">
                      No items yet
                    </EmptyMessage>
                  </TableCell>
                </TableRow>
              )}
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell>{item.description ?? '—'}</TableCell>
                  {isAdmin && (
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => deleteItem.mutate(item.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </PageWrapper>
  )
}

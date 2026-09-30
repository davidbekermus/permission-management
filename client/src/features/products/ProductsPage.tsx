import { useState } from 'react'
import Box from '@mui/material/Box'
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
import { styled } from '@mui/material/styles'
import LockIcon from '@mui/icons-material/Lock'
import DeleteIcon from '@mui/icons-material/Delete'
import { useProducts, useCreateProduct, useDeleteProduct } from './useProducts'
import { getCurrentRoles, isFlowAdmin } from '@/app/auth/auth.utils'
import { Roles } from '@/features/permissionManagement/shared/types'

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 900,
}))

const FormRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  flexWrap: 'wrap',
}))

export function ProductsPage() {
  const roles = getCurrentRoles()
  const hasAccess = isFlowAdmin('PRODUCT') || roles.includes(Roles.PRODUCT_USER)
  const isAdmin = isFlowAdmin('PRODUCT')

  if (!hasAccess) {
    return (
      <PageWrapper>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 2 }}>
          <LockIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
          <Typography variant="h6" color="text.secondary">Unauthorized</Typography>
          <Typography variant="body2" color="text.disabled">
            You don't have permission to access Product Management.
          </Typography>
        </Box>
      </PageWrapper>
    )
  }
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')

  const { data: products = [], isLoading, isError } = useProducts()
  const createProduct = useCreateProduct()
  const deleteProduct = useDeleteProduct()

  const handleCreate = () => {
    if (!name.trim() || isNaN(Number(price))) return
    createProduct.mutate(
      { name: name.trim(), price: Number(price), category: category.trim() || undefined },
      { onSuccess: () => { setName(''); setPrice(''); setCategory('') } },
    )
  }

  return (
    <PageWrapper>
      <Typography variant="h5" gutterBottom>
        Products
      </Typography>

      {isAdmin && (
        <FormRow>
          <TextField
            label="Product name"
            size="small"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Price"
            size="small"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            sx={{ width: 120 }}
          />
          <TextField
            label="Category"
            size="small"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <Button
            variant="contained"
            disabled={!name.trim() || !price || createProduct.isPending}
            onClick={handleCreate}
            startIcon={createProduct.isPending ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Add product
          </Button>
        </FormRow>
      )}

      {isLoading && <CircularProgress size={24} />}
      {isError && <Alert severity="error">Failed to load products. You may not have access.</Alert>}

      {!isLoading && !isError && (
        <TableContainer component={Paper} elevation={0} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Category</TableCell>
                {isAdmin && <TableCell />}
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 4 : 3}>
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                      No products yet
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.category ?? '—'}</TableCell>
                  {isAdmin && (
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => deleteProduct.mutate(product.id)}
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

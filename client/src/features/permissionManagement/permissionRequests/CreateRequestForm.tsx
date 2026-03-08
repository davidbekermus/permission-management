import { useState } from 'react'
import Box from '@mui/material/Box'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { styled } from '@mui/material/styles'
import { useCreatePermissionRequest } from './usePermissionRequests'
import { useAuth } from '@/app/providers/AuthProvider'
import { ALL_ROLES, type Role } from '@/features/auth/types'

const FormWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(3),
}))

export function CreateRequestForm() {
  const { roles: myRoles } = useAuth()
  const [selected, setSelected] = useState<Role[]>([])
  const [snackOpen, setSnackOpen] = useState(false)
  const createRequest = useCreatePermissionRequest()

  const availableRoles = ALL_ROLES.filter((r) => !myRoles.includes(r))

  const handleSubmit = () => {
    if (selected.length === 0) return
    createRequest.mutate(selected, {
      onSuccess: () => {
        setSelected([])
        setSnackOpen(true)
      },
    })
  }

  return (
    <>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Request new roles
      </Typography>
      <FormWrapper>
        <Autocomplete
          multiple
          options={availableRoles}
          value={selected}
          onChange={(_, val) => setSelected(val)}
          getOptionLabel={(r) => r.toLowerCase().replace(/_/g, '-')}
          renderInput={(params) => (
            <TextField {...params} label="Select roles to request" size="small" />
          )}
          sx={{ minWidth: 300, flexGrow: 1 }}
          disabled={createRequest.isPending}
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={selected.length === 0 || createRequest.isPending}
          startIcon={createRequest.isPending ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Submit request
        </Button>
      </FormWrapper>
      {createRequest.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to submit request. Please try again.
        </Alert>
      )}
      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
        message="Permission request submitted"
      />
    </>
  )
}

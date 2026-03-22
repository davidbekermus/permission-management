import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import { styled } from '@mui/material/styles'
import { useNavigate } from '@tanstack/react-router'
import { authApi } from './authApi'
import { useAuth } from '@/app/providers/AuthProvider'

const PageWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default,
}))

const LoginCard = styled(Card)(() => ({
  width: '100%',
  maxWidth: 400,
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
}))

const Form = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}))

export function LoginPage() {
  const [username, setUsername] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: () => authApi.login(username),
    onSuccess: (data) => {
      login(data.access_token)
      navigate({ to: '/app/settings' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim().length >= 2) mutation.mutate()
  }

  return (
    <PageWrapper>
      <LoginCard>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Permission Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your username to continue
          </Typography>
          <Form onSubmit={handleSubmit}>
            {mutation.isError && (
              <Alert severity="error">Login failed. Please try again.</Alert>
            )}
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              fullWidth
              inputProps={{ minLength: 2 }}
              disabled={mutation.isPending}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={username.trim().length < 2 || mutation.isPending}
              startIcon={mutation.isPending ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {mutation.isPending ? 'Signing in…' : 'Sign in'}
            </Button>
          </Form>
        </CardContent>
      </LoginCard>
    </PageWrapper>
  )
}

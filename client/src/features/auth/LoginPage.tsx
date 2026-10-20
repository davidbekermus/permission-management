import { PageWrapper, LoginCard, Form, LoginContent, LoginDescription } from './LoginPage.style'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { authApi } from './authApi'
import { setUserToken } from '@/app/auth/auth.utils'




export const LoginPage = () => {
  const [username, setUsername] = useState('')
  const navigate = useNavigate()
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: () => authApi.login(username),
    onSuccess: async (data) => {
      setUserToken(data.access_token)
      await router.invalidate()
      await navigate({ to: '/app/settings' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim().length >= 2) mutation.mutate()
  }

  return (
    <PageWrapper>
      <LoginCard>
        <LoginContent>
          <Typography variant="h5" gutterBottom>
            Permission Management
          </Typography>
          <LoginDescription variant="body2" color="text.secondary">
            Enter your username to continue
          </LoginDescription>
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
        </LoginContent>
      </LoginCard>
    </PageWrapper>
  )
}

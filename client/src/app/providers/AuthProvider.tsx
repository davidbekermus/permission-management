import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { jwtDecode } from 'jwt-decode'
import type { Role, JwtPayload } from '@/features/auth/types'

interface AuthContextValue {
  username: string | null
  roles: Role[]
  isAuthenticated: boolean
  isAnomalyAdmin: boolean
  isAdmin: boolean
  isFlowAdmin: (flow: string) => boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'pm_token'

function decodeToken(token: string): JwtPayload | null {
  try {
    const payload = jwtDecode<JwtPayload>(token)
    if (payload.exp * 1000 < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(null)
  const [roles, setRoles] = useState<Role[]>([])

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      const payload = decodeToken(token)
      if (payload) {
        setUsername(payload.username)
        setRoles(payload.roles)
      } else {
        localStorage.removeItem(TOKEN_KEY)
      }
    }
  }, [])

  const login = useCallback((token: string) => {
    localStorage.setItem(TOKEN_KEY, token)
    const payload = decodeToken(token)
    if (payload) {
      setUsername(payload.username)
      setRoles(payload.roles)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUsername(null)
    setRoles([])
  }, [])

  const isAuthenticated = username !== null
  const isAnomalyAdmin = roles.includes('ANOMALY_ADMIN')
  const isFlowAdmin = useCallback(
    (flow: string) => isAnomalyAdmin || roles.includes(`${flow}_ADMIN` as Role),
    [isAnomalyAdmin, roles],
  )
  const isAdmin = isAnomalyAdmin || roles.some((r) => r.endsWith('_ADMIN'))

  return (
    <AuthContext.Provider
      value={{ username, roles, isAuthenticated, isAnomalyAdmin, isAdmin, isFlowAdmin, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

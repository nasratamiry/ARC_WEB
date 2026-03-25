import { createContext, useContext } from 'react'
import type { AuthUser, MeUser } from '../services/auth'

export type AuthTokens = {
  access: string
  refresh: string
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export type AuthContextValue = {
  status: AuthStatus
  tokens: AuthTokens | null
  user: AuthUser | null
  me: MeUser | null

  signup: (payload: { full_name: string; email: string; phone_number: string; password: string }) => Promise<{
    message: string
    email_sent: boolean
  }>
  verifyEmail: (payload: { email: string; code: string }) => Promise<{ message: string }>
  resendVerification: (payload: { email: string }) => Promise<{ message: string }>

  login: (payload: { email: string; password: string }) => Promise<void>
  logout: (payload?: { refresh_token?: string; fcm_token?: string }) => Promise<void>

  forgotPassword: (payload: { email: string }) => Promise<{ message: string }>
  verifyResetCode: (payload: { email: string; code: string }) => Promise<{ message: string }>
  resetPassword: (payload: { new_password: string }) => Promise<{ message: string }>

  refreshMe: () => Promise<void>
  deleteAccount: () => Promise<{ message: string }>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


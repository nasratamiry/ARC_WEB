import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalizedPath } from '../hooks'
import { setOnAuthFailure, setStoredAuthTokens, getStoredAuthTokens } from '../services/api'
import * as authApi from '../services/auth'
import { getResetSession, setResetSession } from './resetSession'
import { AuthContext } from './AuthContext'

type Props = {
  children: ReactNode
}

const AUTH_USER_KEY = 'arc-user'

const readStoredUser = (): authApi.AuthUser | null => {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as authApi.AuthUser
  } catch {
    return null
  }
}

const writeStoredUser = (value: authApi.AuthUser | null): void => {
  try {
    if (!value) localStorage.removeItem(AUTH_USER_KEY)
    else localStorage.setItem(AUTH_USER_KEY, JSON.stringify(value))
  } catch {
    // ignore
  }
}

function AuthProvider({ children }: Props) {
  const navigate = useNavigate()
  const { withLang } = useLocalizedPath()

  const [tokens, setTokens] = useState(() => getStoredAuthTokens())
  const [user, setUser] = useState<authApi.AuthUser | null>(() => readStoredUser())
  const [me, setMe] = useState<authApi.MeUser | null>(null)
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')

  const clearSession = useCallback(() => {
    setStoredAuthTokens(null)
    setTokens(null)
    writeStoredUser(null)
    setUser(null)
    setMe(null)
    setStatus('unauthenticated')
  }, [])

  const refreshMe = useCallback(async () => {
    if (!getStoredAuthTokens()) {
      setMe(null)
      setStatus('unauthenticated')
      return
    }

    setStatus('loading')
    try {
      const profile = await authApi.me()
      setMe(profile)
      setStatus('authenticated')
    } catch {
      // If token is invalid and refresh also fails, api.ts will call onAuthFailure and clear tokens.
      setStatus(getStoredAuthTokens() ? 'authenticated' : 'unauthenticated')
    }
  }, [])

  useEffect(() => {
    setOnAuthFailure(() => {
      clearSession()
      navigate(withLang('/login'), { replace: true })
    })
    return () => setOnAuthFailure(null)
  }, [clearSession, navigate, withLang])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshMe()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [refreshMe])

  const signup = useCallback(async (payload: authApi.SignupRequest) => {
    const result = await authApi.signup(payload)
    // Backend returns: { message, user, email_sent, error? }
    setUser(result.user)
    writeStoredUser(result.user)
    return { message: result.message, email_sent: result.email_sent }
  }, [])

  const verifyEmail = useCallback(async (payload: authApi.VerifyEmailRequest) => {
    const result = await authApi.verifyEmail(payload)
    setUser(result.user)
    writeStoredUser(result.user)
    return { message: result.message }
  }, [])

  const resendVerification = useCallback(async (payload: authApi.ResendVerificationRequest) => {
    return authApi.resendVerification(payload)
  }, [])

  const login = useCallback(async (payload: authApi.LoginRequest) => {
    const result = await authApi.login(payload)
    const nextTokens = { access: result.access, refresh: result.refresh }
    setStoredAuthTokens(nextTokens)
    setTokens(nextTokens)
    setUser(result.user)
    writeStoredUser(result.user)
    setStatus('authenticated')
    // Load /me for admin flag
    try {
      const profile = await authApi.me()
      setMe(profile)
    } catch {
      setMe(null)
    }
  }, [])

  const logout = useCallback(
    async (payload?: authApi.LogoutRequest) => {
      const current = getStoredAuthTokens()
      // Clear client session immediately so UI updates without requiring refresh.
      clearSession()
      void authApi
        .logout({ refresh_token: payload?.refresh_token ?? current?.refresh, fcm_token: payload?.fcm_token })
        .catch(() => {
          // Ignore server logout failures after local session is already cleared.
        })
    },
    [clearSession],
  )

  const forgotPassword = useCallback(async (payload: authApi.ForgotPasswordRequest) => {
    return authApi.forgotPassword(payload)
  }, [])

  const verifyResetCode = useCallback(async (payload: authApi.VerifyResetCodeRequest) => {
    const result = await authApi.verifyResetCode(payload)
    setResetSession({
      email: payload.email,
      reset_token: result.reset_token,
      expires_at: Date.now() + result.expires_in_minutes * 60_000,
    })
    return { message: result.message }
  }, [])

  const resetPassword = useCallback(async (payload: { new_password: string }) => {
    const session = getResetSession()
    if (!session) {
      throw new Error('Reset session expired. Please request a new password reset.')
    }
    const result = await authApi.resetPassword({ reset_token: session.reset_token, new_password: payload.new_password })
    setResetSession(null)
    return result
  }, [])

  const deleteAccount = useCallback(async () => {
    const result = await authApi.deleteAccount()
    // Backend logs user out everywhere; clear local session too.
    clearSession()
    return result
  }, [clearSession])

  const value = useMemo(
    () => ({
      status,
      tokens,
      user,
      me,
      signup,
      verifyEmail,
      resendVerification,
      login,
      logout,
      forgotPassword,
      verifyResetCode,
      resetPassword,
      refreshMe,
      deleteAccount,
    }),
    [
      status,
      tokens,
      user,
      me,
      signup,
      verifyEmail,
      resendVerification,
      login,
      logout,
      forgotPassword,
      verifyResetCode,
      resetPassword,
      refreshMe,
      deleteAccount,
    ],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export default AuthProvider


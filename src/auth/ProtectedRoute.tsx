import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from './AuthContext'
import { useLocalizedPath } from '../hooks'

function ProtectedRoute() {
  const auth = useAuth()
  const location = useLocation()
  const { withLang } = useLocalizedPath()
  const { t } = useTranslation()

  useEffect(() => {
    if (auth.status !== 'unauthenticated') return
    toast.error(t('auth.loginToContinue'), { id: 'auth-required' })
  }, [auth.status, t])

  if (auth.status === 'loading') {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4">
        <div className="h-10 w-10 animate-pulse rounded-full bg-arc-muted" />
        <div className="h-4 w-40 animate-pulse rounded-lg bg-arc-muted" />
        <p className="text-sm text-arc-subtext">{t('reservation.loading')}</p>
      </div>
    )
  }

  if (auth.status !== 'authenticated') {
    const next = `${location.pathname}${location.search}`
    return <Navigate to={`${withLang('/login')}?next=${encodeURIComponent(next)}`} replace />
  }

  return <Outlet />
}

export default ProtectedRoute

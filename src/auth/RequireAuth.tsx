import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useLocalizedPath } from '../hooks'
import { useAuth } from './AuthContext'

type Props = {
  children: ReactNode
}

function RequireAuth({ children }: Props) {
  const { status } = useAuth()
  const location = useLocation()
  const { withLang } = useLocalizedPath()

  if (status === 'loading') return null
  if (status !== 'authenticated') {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`${withLang('/login')}?next=${next}`} replace />
  }
  return children
}

export default RequireAuth


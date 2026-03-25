import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import RequireAuth from '../auth/RequireAuth'
import Seo from '../shared/components/Seo'
import { useLocalizedPath } from '../hooks'
import { Button, Card, PageHeader, SectionContainer } from '../shared/ui'

function DeleteAccountModal({
  open,
  onClose,
  onConfirm,
  isSubmitting,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isSubmitting: boolean
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-arc-border bg-white p-6 shadow-card">
        <h2 className="text-xl font-bold text-arc-text">Delete Account</h2>
        <p className="mt-3 text-sm text-arc-subtext">
          This will permanently remove your account and log you out. Are you sure?
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500"
          >
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProfilePageInner() {
  const { t } = useTranslation()
  const auth = useAuth()
  const { withLang } = useLocalizedPath()
  const navigate = useNavigate()

  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const userName = auth.me?.full_name ?? auth.user?.full_name ?? ''
  const userEmail = auth.me?.email ?? auth.user?.email ?? ''
  const isAdmin = Boolean(auth.me?.is_admin)

  useEffect(() => {
    // Profile data is loaded by AuthProvider. If it's not ready yet, let it render with loading states.
  }, [])

  const userBadge = useMemo(() => {
    if (!isAdmin) return null
    return (
      <span className="inline-flex items-center rounded-xl border border-primary/50 bg-primary/12 px-3 py-1 text-xs font-semibold text-primary-dark">
        Admin
      </span>
    )
  }, [isAdmin])

  const onLogout = async () => {
    await auth.logout()
    navigate(withLang('/login'), { replace: true })
  }

  const onDeleteConfirm = async () => {
    setIsDeleting(true)
    try {
      await auth.deleteAccount()
      navigate(withLang('/login'), { replace: true })
    } finally {
      setIsDeleting(false)
      setDeleteOpen(false)
    }
  }

  return (
    <SectionContainer>
      <Seo title="Profile" description="View your ARC account profile." />
      <PageHeader
        eyebrow={t('nav.brand')}
        title="Your Profile"
        description="Manage your account details."
        actions={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onLogout}>
              Logout
            </Button>
          </div>
        }
      />

      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-arc-text">{userName || '—'}</h2>
              <p className="mt-1 text-body">{userEmail || '—'}</p>
              {userBadge ? <div className="mt-4">{userBadge}</div> : null}
            </div>
            <div className="mt-6 sm:mt-0">
              <Button variant="secondary" onClick={() => setDeleteOpen(true)} className="border-red-400 text-red-600 hover:bg-red-500/10 focus-visible:ring-red-500">
                Delete account
              </Button>
            </div>
          </div>

          <p className="mt-6 text-sm text-arc-subtext">
            Tokens are invalidated after logout and delete account as handled by the backend session logic.
          </p>
        </Card>
      </div>

      <DeleteAccountModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={onDeleteConfirm} isSubmitting={isDeleting} />
    </SectionContainer>
  )
}

function ProfilePage() {
  return (
    <RequireAuth>
      <ProfilePageInner />
    </RequireAuth>
  )
}

export default ProfilePage


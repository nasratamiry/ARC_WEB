import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, LogOut, Mail, MessageSquareText, ShieldCheck, Trash2, UserRound, Video } from 'lucide-react'
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
  const { t, i18n } = useTranslation()
  const isRtl = i18n.dir() === 'rtl'

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-arc-border bg-white p-6 shadow-card">
        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-amber-300 bg-amber-50 text-amber-600">
          <AlertTriangle className="h-5 w-5" aria-hidden />
        </div>
        <h2 className={`text-xl font-bold text-arc-text ${isRtl ? 'text-right' : 'text-left'}`}>{t('profile.deleteTitle')}</h2>
        <p className={`mt-3 text-sm text-arc-subtext ${isRtl ? 'text-right' : 'text-left'}`}>
          {t('profile.deleteDescription')}
        </p>
        <div className={`mt-6 flex flex-col gap-3 sm:flex-row ${isRtl ? 'sm:justify-start' : 'sm:justify-end'}`}>
          <Button variant="secondary" type="button" onClick={onClose} disabled={isSubmitting}>
            {t('profile.cancel')}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500"
          >
            {isSubmitting ? t('profile.deleting') : t('profile.delete')}
          </Button>
        </div>
      </div>
    </div>
  )
}

function LogoutConfirmModal({
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
  const { t, i18n } = useTranslation()
  const isRtl = i18n.dir() === 'rtl'

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-arc-border bg-white p-6 shadow-card">
        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
          <LogOut className="h-5 w-5" aria-hidden />
        </div>
        <h2 className={`text-xl font-bold text-arc-text ${isRtl ? 'text-right' : 'text-left'}`}>{t('profile.logoutTitle')}</h2>
        <p className={`mt-3 text-sm text-arc-subtext ${isRtl ? 'text-right' : 'text-left'}`}>
          {t('profile.logoutDescription')}
        </p>
        <div className={`mt-6 flex flex-col gap-3 sm:flex-row ${isRtl ? 'sm:justify-start' : 'sm:justify-end'}`}>
          <Button variant="secondary" type="button" onClick={onClose} disabled={isSubmitting}>
            {t('profile.cancel')}
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isSubmitting}>
            {t('nav.logout')}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProfilePageInner() {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.dir() === 'rtl'
  const auth = useAuth()
  const { withLang } = useLocalizedPath()
  const navigate = useNavigate()

  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)

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
        {t('profile.admin')}
      </span>
    )
  }, [isAdmin, t])

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
      <Seo title={t('profile.title')} description={t('profile.description')} />
      <PageHeader
        eyebrow={t('nav.brand')}
        title={t('profile.title')}
        description={t('profile.description')}
        actions={
          <div className={`flex gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <Button variant="secondary" onClick={() => navigate(withLang('/chat'))}>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-900">
                <MessageSquareText className="h-[18px] w-[18px]" aria-hidden />
              </span>
              {t('nav.chat')}
            </Button>
            <Button variant="secondary" onClick={() => navigate(withLang('/conference'))}>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-900">
                <Video className="h-[18px] w-[18px]" aria-hidden />
              </span>
              {t('nav.conference')}
            </Button>
            <Button variant="secondary" onClick={() => setLogoutOpen(true)}>
              <LogOut className="h-4 w-4" aria-hidden />
              {t('nav.logout')}
            </Button>
          </div>
        }
      />

      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <div className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
            <div className={`inline-flex w-fit items-center gap-1.5 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                <UserRound className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 leading-tight">
                <h2 className="text-2xl font-bold text-arc-text">{userName || '—'}</h2>
                <p className={`mt-1 inline-flex items-center gap-1.5 text-body ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <Mail className="h-4 w-4 text-arc-subtext" aria-hidden />
                  <span>{userEmail || '—'}</span>
                </p>
              </div>
            </div>
            <div className="mt-1 sm:mt-0">
              <Button
                variant="secondary"
                onClick={() => setDeleteOpen(true)}
                className="border-red-400 text-red-600 hover:bg-red-500/10 focus-visible:ring-red-500"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                {t('profile.deleteAccount')}
              </Button>
            </div>
          </div>

          {userBadge ? <div className="mt-4">{userBadge}</div> : null}

          <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/[0.05] p-4">
            <div className={`flex items-center gap-2 text-arc-text ${isRtl ? 'flex-row-reverse justify-start' : ''}`}>
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
              <p className="text-sm font-semibold">{t('profile.securityTitle')}</p>
            </div>
            <p className={`mt-2 text-sm text-arc-subtext ${isRtl ? 'text-right' : 'text-left'}`}>
              {t('profile.note')}
            </p>
          </div>
        </Card>
      </div>

      <DeleteAccountModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={onDeleteConfirm} isSubmitting={isDeleting} />
      <LogoutConfirmModal open={logoutOpen} onClose={() => setLogoutOpen(false)} onConfirm={onLogout} isSubmitting={false} />
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


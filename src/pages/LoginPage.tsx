import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../services/api'
import Seo from '../shared/components/Seo'
import { useLocalizedPath } from '../hooks'
import { Button } from '../shared/ui'
import { useAuth } from '../auth/AuthContext'
import AuthPageShell from '../auth/AuthPageShell'
import AuthTextInput from '../auth/AuthTextInput'
import { LockIcon, MailIcon } from '../auth/AuthIcons'
import AuthErrorFeedback from '../auth/AuthErrorFeedback'
import { motion } from 'framer-motion'

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

function LoginPage() {
  const { t } = useTranslation()
  const { withLang } = useLocalizedPath()
  const auth = useAuth()
  const navigate = useNavigate()
  const query = useQuery()

  const [email, setEmail] = useState(query.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const next = query.get('next')

  useEffect(() => {
    if (auth.status !== 'authenticated') return
    navigate(next ? decodeURIComponent(next) : withLang('/profile'), { replace: true })
  }, [auth.status, navigate, next, withLang])

  const submitLogin = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      await auth.login({ email: email.trim(), password })
      navigate(next ? decodeURIComponent(next) : withLang('/profile'), { replace: true })
    } catch (e) {
      if (e instanceof ApiError) {
        // 403 (email not verified) must redirect to verify page (mobile-like)
        if (e.status === 403 && e.authReason === 'email_not_verified') {
          navigate(
            `${withLang('/verify-email')}?email=${encodeURIComponent(email.trim())}&message=${encodeURIComponent(e.message)}`,
            { replace: true },
          )
          return
        }
        setError(e)
      } else if (e instanceof Error) {
        setError(new ApiError(e.message))
      } else {
        setError(new ApiError('Unable to login. Please try again.'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    await submitLogin()
  }

  return (
    <>
      <Seo title={t('auth.loginTitle')} description={t('auth.loginDescription')} />
      <AuthPageShell
        eyebrow={t('nav.brand')}
        title={t('auth.signInTitle')}
        description={t('auth.loginDescription')}
      >
        <motion.form
          className="space-y-5"
          onSubmit={onSubmit}
          noValidate
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <AuthTextInput
            id="email"
            label={t('auth.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            icon={<MailIcon />}
          />

          <AuthTextInput
            id="password"
            label={t('auth.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            icon={<LockIcon />}
          />

          <div className="-mt-1 flex items-center justify-between gap-4 text-sm">
            <label className="inline-flex cursor-pointer items-center gap-2 font-medium text-slate-700">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-arc-border text-primary focus:ring-primary/40"
                disabled={isSubmitting}
              />
              <span>{t('auth.rememberMe')}</span>
            </label>
            <Link
              to={withLang('/forgot-password')}
              className="shrink-0 whitespace-nowrap text-sm font-semibold text-primary hover:text-primary-dark"
            >
              {t('auth.forgotPasswordLink')}
            </Link>
          </div>

          {error ? (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <AuthErrorFeedback error={error} onRetry={() => void submitLogin()} retryDisabled={isSubmitting} />
            </motion.div>
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t('auth.signingIn') : t('auth.loginCta')}
          </Button>
        </motion.form>

        <div className="mt-8 rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-4 text-center text-sm font-medium text-slate-700">
          {t('auth.newToArc')} <Link to={withLang('/signup')} className="font-semibold text-primary-dark hover:text-primary">{t('auth.createAccountLink')}</Link>
        </div>
      </AuthPageShell>
    </>
  )
}

export default LoginPage


import { type FormEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../services/api'
import Seo from '../shared/components/Seo'
import { useLocalizedPath } from '../hooks'
import { Button } from '../shared/ui'
import { useAuth } from '../auth/AuthContext'
import AuthPageShell from '../auth/AuthPageShell'
import AuthTextInput from '../auth/AuthTextInput'
import { LockIcon, MailIcon } from '../auth/AuthIcons'
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const next = query.get('next')

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await auth.login({ email: email.trim(), password })
      navigate(next ? decodeURIComponent(next) : withLang('/'), { replace: true })
    } catch (e) {
      if (e instanceof ApiError) {
        // 403 (email not verified) must redirect to verify page (mobile-like)
        if (e.status === 403 && /verification|verify|email/i.test(e.message)) {
          navigate(
            `${withLang('/verify-email')}?email=${encodeURIComponent(email.trim())}&message=${encodeURIComponent(e.message)}`,
            { replace: true },
          )
          return
        }
        setError(e.message)
      } else if (e instanceof Error) {
        setError(e.message)
      } else {
        setError('Unable to login. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Seo title={t('auth.loginTitle')} description={t('auth.loginDescription')} />
      <AuthPageShell
        eyebrow={t('nav.brand')}
        title={t('auth.loginTitle')}
        description={t('auth.loginDescription')}
      >
        <motion.form
          className="space-y-4"
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

          {error ? (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </motion.p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t('auth.signingIn') : t('auth.loginCta')}
          </Button>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <a className="text-primary-dark hover:text-primary" href={withLang('/forgot-password')}>
              {t('auth.forgotPasswordLink')}
            </a>
            <a className="text-arc-subtext hover:text-arc-text" href={withLang('/signup')}>
              {t('auth.createAccountLink')}
            </a>
          </div>
        </motion.form>
      </AuthPageShell>
    </>
  )
}

export default LoginPage


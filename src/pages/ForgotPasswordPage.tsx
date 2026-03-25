import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Seo from '../shared/components/Seo'
import { useLocalizedPath } from '../hooks'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../services/api'
import { Button } from '../shared/ui'
import AuthPageShell from '../auth/AuthPageShell'
import AuthTextInput from '../auth/AuthTextInput'
import { MailIcon } from '../auth/AuthIcons'
import { motion } from 'framer-motion'

function ForgotPasswordPage() {
  const { t } = useTranslation()
  const { withLang } = useLocalizedPath()
  const navigate = useNavigate()
  const auth = useAuth()

  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    setSuccessMessage(null)

    try {
      const result = await auth.forgotPassword({ email: email.trim() })
      setSuccessMessage(result.message)
      navigate(`${withLang('/verify-reset-code')}?email=${encodeURIComponent(email.trim())}&message=${encodeURIComponent(result.message)}`, { replace: true })
    } catch (e) {
      if (e instanceof ApiError) setSubmitError(e.message)
      else if (e instanceof Error) setSubmitError(e.message)
      else setSubmitError('Failed to start reset. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Seo title={t('auth.forgotPasswordTitle')} description={t('auth.forgotPasswordDescription')} />
      <AuthPageShell
        eyebrow={t('nav.brand')}
        title={t('auth.forgotPasswordTitle')}
        description={t('auth.forgotPasswordDescription')}
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
            required
            autoComplete="email"
            icon={<MailIcon />}
          />

          {submitError ? (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {submitError}
            </motion.p>
          ) : null}

          {successMessage ? (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-800"
              role="status"
            >
              {successMessage}
            </motion.p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t('auth.sending') : t('auth.sendResetCode')}
          </Button>

          <p className="text-small text-center">
            {t('auth.backToLogin')}{' '}
            <a className="text-primary-dark hover:text-primary" href={withLang('/login')}>
              {t('auth.loginCta')}
            </a>
          </p>
        </motion.form>
      </AuthPageShell>
    </>
  )
}

export default ForgotPasswordPage


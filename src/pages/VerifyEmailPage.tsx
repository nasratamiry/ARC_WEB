import { type FormEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import Seo from '../shared/components/Seo'
import { useLocalizedPath } from '../hooks'
import { Button } from '../shared/ui'
import { ApiError } from '../services/api'
import { useAuth } from '../auth/AuthContext'
import AuthPageShell from '../auth/AuthPageShell'
import AuthTextInput from '../auth/AuthTextInput'
import { KeyIcon } from '../auth/AuthIcons'
import { motion } from 'framer-motion'

const useQuery = () => {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

function VerifyEmailPage() {
  const { t } = useTranslation()
  const query = useQuery()
  const navigate = useNavigate()
  const auth = useAuth()
  const { withLang } = useLocalizedPath()

  const email = query.get('email') ?? ''
  const message = query.get('message') ?? null
  const emailSent = query.get('email_sent') ?? null

  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const hasEmail = Boolean(email.trim())

  const normalizedInitialMessage = useMemo(() => {
    if (!hasEmail) return null
    if (message) return message
    if (emailSent === 'false')
      return "We couldn't send the verification email. Please use Resend to get the code."
    if (emailSent === 'true') return 'Enter the 6-digit code sent to your email.'
    return 'Enter the 6-digit code sent to your email.'
  }, [emailSent, hasEmail, message])

  const onVerify = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await auth.verifyEmail({ email: email.trim(), code })
      setSuccess(result.message)
      // Success -> redirect to login
      navigate(withLang('/login'), { replace: true })
    } catch (e) {
      if (e instanceof ApiError) setError(e.message)
      else if (e instanceof Error) setError(e.message)
      else setError('Verification failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onResend = async () => {
    if (!hasEmail) return
    setIsResending(true)
    setError(null)
    setSuccess(null)
    try {
      const result = await auth.resendVerification({ email: email.trim() })
      setSuccess(result.message)
    } catch (e) {
      if (e instanceof ApiError) setError(e.message)
      else if (e instanceof Error) setError(e.message)
      else setError('Failed to resend code. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <>
      <Seo title={t('auth.verifyEmailTitle')} description={t('auth.verifyEmailDescription')} />
      <AuthPageShell eyebrow={t('nav.brand')} title={t('auth.verifyEmailTitle')} description={t('auth.verifyEmailDescription')}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          {!hasEmail ? (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {t('auth.missingEmail')}
            </motion.p>
          ) : null}

          {normalizedInitialMessage ? (
            <p className="text-sm text-arc-subtext">{normalizedInitialMessage}</p>
          ) : null}

          <form className="space-y-4" onSubmit={onVerify} noValidate>
            <AuthTextInput
              id="code"
              label={t('auth.verificationCode')}
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              required
              icon={<KeyIcon />}
              error={error}
            />

            {success ? (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-800"
                role="status"
              >
                {success}
              </motion.p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting || !hasEmail || code.length !== 6}>
              {isSubmitting ? t('auth.verifying') : t('auth.verify')}
            </Button>
          </form>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
            <p className="text-small text-arc-subtext">{t('auth.didntReceiveCode')}</p>
            <Button type="button" variant="secondary" onClick={() => void onResend()} disabled={isResending || !hasEmail}>
              {isResending ? t('auth.resending') : t('auth.resendCode')}
            </Button>
          </div>
        </motion.div>
      </AuthPageShell>
    </>
  )
}

export default VerifyEmailPage


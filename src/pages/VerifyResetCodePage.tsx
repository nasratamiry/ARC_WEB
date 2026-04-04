import { type FormEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import Seo from '../shared/components/Seo'
import { useLocalizedPath } from '../hooks'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../services/api'
import { Button } from '../shared/ui'
import AuthPageShell from '../auth/AuthPageShell'
import AuthTextInput from '../auth/AuthTextInput'
import { KeyIcon } from '../auth/AuthIcons'
import AuthErrorFeedback from '../auth/AuthErrorFeedback'
import { motion } from 'framer-motion'

const useQuery = () => {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

function VerifyResetCodePage() {
  const { t } = useTranslation()
  const { withLang } = useLocalizedPath()
  const auth = useAuth()
  const navigate = useNavigate()
  const query = useQuery()

  const email = query.get('email') ?? ''
  const message = query.get('message') ?? null

  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<ApiError | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const hasEmail = Boolean(email.trim())

  const submitVerifyCode = async () => {
    const normalizedCode = code.trim().replace(/\s+/g, '')
    setIsSubmitting(true)
    setSubmitError(null)
    setSuccessMessage(null)

    try {
      const result = await auth.verifyResetCode({ email: email.trim(), code: normalizedCode })
      setSuccessMessage(result.message)
      navigate(withLang('/reset-password'), { replace: true })
    } catch (e) {
      if (e instanceof ApiError) setSubmitError(e)
      else if (e instanceof Error) setSubmitError(new ApiError(e.message))
      else setSubmitError(new ApiError('Invalid reset code. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    await submitVerifyCode()
  }

  return (
    <>
      <Seo title={t('auth.verifyResetCodeTitle')} description={t('auth.verifyResetCodeDescription')} />
      <AuthPageShell
        eyebrow={t('nav.brand')}
        title={t('auth.verifyResetCodeTitle')}
        description={t('auth.verifyResetCodeDescription')}
      >
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
              Missing email. Please restart the reset flow.
            </motion.p>
          ) : null}

          {message ? <p className="text-sm text-arc-subtext">{message}</p> : null}

          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <AuthTextInput
              id="code"
              label={t('auth.resetCode')}
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              required
              icon={<KeyIcon />}
              error={submitError?.message ?? null}
            />

            {submitError ? (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <AuthErrorFeedback error={submitError} onRetry={() => void submitVerifyCode()} retryDisabled={isSubmitting} />
              </motion.div>
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

            <Button type="submit" className="w-full" disabled={isSubmitting || !hasEmail || code.trim().replace(/\s+/g, '').length !== 6}>
              {isSubmitting ? t('auth.verifying') : t('auth.verify')}
            </Button>

            <p className="text-small text-center">
              <a className="text-primary-dark hover:text-primary" href={withLang('/forgot-password')}>
                Resend by starting over
              </a>
            </p>
          </form>
        </motion.div>
      </AuthPageShell>
    </>
  )
}

export default VerifyResetCodePage


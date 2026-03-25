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
import { LockIcon } from '../auth/AuthIcons'
import { motion } from 'framer-motion'

function ResetPasswordPage() {
  const { t } = useTranslation()
  const { withLang } = useLocalizedPath()
  const auth = useAuth()
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    setSuccessMessage(null)
    try {
      const result = await auth.resetPassword({ new_password: newPassword })
      setSuccessMessage(result.message)
      navigate(withLang('/login'), { replace: true })
    } catch (e) {
      if (e instanceof ApiError) setSubmitError(e.message)
      else if (e instanceof Error) setSubmitError(e.message)
      else setSubmitError('Reset failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Seo title={t('auth.resetPasswordTitle')} description={t('auth.resetPasswordDescription')} />
      <AuthPageShell eyebrow={t('nav.brand')} title={t('auth.resetPasswordTitle')} description={t('auth.resetPasswordDescription')}>
        <motion.form
          className="space-y-4"
          onSubmit={onSubmit}
          noValidate
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <AuthTextInput
            id="new_password"
            label={t('auth.newPassword')}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            icon={<LockIcon />}
            error={submitError}
          />

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

          <Button type="submit" className="w-full" disabled={isSubmitting || newPassword.length < 6}>
            {isSubmitting ? t('auth.resetting') : t('auth.resetPasswordCta')}
          </Button>

          <p className="text-small text-center">
            <a className="text-primary-dark hover:text-primary" href={withLang('/login')}>
              {t('auth.backToLogin')}
            </a>
          </p>
        </motion.form>
      </AuthPageShell>
    </>
  )
}

export default ResetPasswordPage


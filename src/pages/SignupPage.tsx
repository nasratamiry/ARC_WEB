import { type FormEvent, useState } from 'react'
import { useLocalizedPath } from '../hooks'
import { useAuth } from '../auth/AuthContext'
import Seo from '../shared/components/Seo'
import { Button } from '../shared/ui'
import { ApiError } from '../services/api'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import AuthPageShell from '../auth/AuthPageShell'
import AuthTextInput from '../auth/AuthTextInput'
import { LockIcon, MailIcon, PhoneIcon, UserIcon } from '../auth/AuthIcons'
import { motion } from 'framer-motion'

function SignupPage() {
  const { t } = useTranslation()
  const { withLang } = useLocalizedPath()
  const navigate = useNavigate()
  const auth = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Partial<Record<'full_name' | 'email' | 'phone_number' | 'password', string>>>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    setFormErrors({})
    setSuccessMessage(null)

    try {
      const result = await auth.signup({ full_name: fullName.trim(), email: email.trim(), phone_number: phoneNumber.trim(), password })
      setSuccessMessage(result.message)
      navigate(
        `${withLang('/verify-email')}?email=${encodeURIComponent(email.trim())}&email_sent=${encodeURIComponent(String(result.email_sent))}&message=${encodeURIComponent(result.message)}`,
        { replace: true },
      )
    } catch (e) {
      if (e instanceof ApiError) {
        setSubmitError(e.message)
        if (e.details) {
          setFormErrors({
            full_name: e.details.full_name?.[0] ?? undefined,
            email: e.details.email?.[0] ?? undefined,
            phone_number: e.details.phone_number?.[0] ?? undefined,
            password: e.details.password?.[0] ?? undefined,
          })
        }
      }
      else if (e instanceof Error) setSubmitError(e.message)
      else setSubmitError('Unable to sign up. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Seo title={t('auth.signupTitle')} description={t('auth.signupDescription')} />
      <AuthPageShell
        eyebrow={t('nav.brand')}
        title={t('auth.signupTitle')}
        description={t('auth.signupDescription')}
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
            id="full_name"
            label={t('auth.fullName')}
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value)
              setFormErrors((prev) => ({ ...prev, full_name: undefined }))
            }}
            error={formErrors.full_name ?? null}
            required
            icon={<UserIcon />}
          />

          <AuthTextInput
            id="email"
            label={t('auth.email')}
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setFormErrors((prev) => ({ ...prev, email: undefined }))
            }}
            error={formErrors.email ?? null}
            required
            icon={<MailIcon />}
          />

          <AuthTextInput
            id="phone_number"
            label={t('auth.phoneNumber')}
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value)
              setFormErrors((prev) => ({ ...prev, phone_number: undefined }))
            }}
            error={formErrors.phone_number ?? null}
            required
            icon={<PhoneIcon />}
          />

          <AuthTextInput
            id="password"
            label={t('auth.password')}
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setFormErrors((prev) => ({ ...prev, password: undefined }))
            }}
            error={formErrors.password ?? null}
            required
            icon={<LockIcon />}
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
            {isSubmitting ? t('auth.creating') : t('auth.createAccount')}
          </Button>

          <p className="text-small text-center">
            {t('auth.alreadyHaveAccount')}{' '}
            <a className="text-primary-dark hover:text-primary" href={withLang('/login')}>
              {t('auth.loginCta')}
            </a>
          </p>
        </motion.form>
      </AuthPageShell>
    </>
  )
}

export default SignupPage


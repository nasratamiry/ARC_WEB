import { type ChangeEvent, type FormEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { sendMessage } from '../services/contact'
import { ApiError } from '../services/api'
import type { ContactPayload } from '../types/api'
import { Button, Card, PageHeader, SectionContainer } from '../shared/ui'

type FormErrors = Partial<Record<keyof ContactPayload, string>>

type InputFieldProps = {
  id: keyof ContactPayload
  label: string
  type?: 'text' | 'email'
  value: string
  error?: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

function InputField({ id, label, type = 'text', value, error, onChange }: InputFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-arc-text">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-arc-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40 ${
          error ? 'border-red-400' : 'border-arc-border'
        }`}
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  )
}

type TextAreaFieldProps = {
  id: keyof ContactPayload
  label: string
  value: string
  error?: string
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
}

function TextAreaField({ id, label, value, error, onChange }: TextAreaFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-arc-text">
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        rows={6}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-arc-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40 ${
          error ? 'border-red-400' : 'border-arc-border'
        }`}
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  )
}

const initialFormState: ContactPayload = {
  name: '',
  email: '',
  message: '',
}

function ContactPage() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<ContactPayload>(initialFormState)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, [])

  const validate = (): FormErrors => {
    const errors: FormErrors = {}

    if (!formData.name.trim()) errors.name = t('contact.validationNameRequired')
    if (!formData.email.trim()) {
      errors.email = t('contact.validationEmailRequired')
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = t('contact.validationEmailInvalid')
    }
    if (!formData.message.trim()) errors.message = t('contact.validationMessageRequired')

    return errors
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFormErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleMessageChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target
    setFormData((prev) => ({ ...prev, message: value }))
    setFormErrors((prev) => ({ ...prev, message: undefined }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccessMessage(null)
    setSubmitError(null)

    const errors = validate()
    setFormErrors(errors)
    if (Object.keys(errors).length) return

    setIsSubmitting(true)
    try {
      const response = await sendMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
      })

      setSuccessMessage(response.message ?? response.detail ?? t('contact.successDefault'))
      setFormData(initialFormState)
      setFormErrors({})
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message)

        if (error.details) {
          setFormErrors({
            name: error.details.name?.[0],
            email: error.details.email?.[0],
            message: error.details.message?.[0],
          })
        }
      } else {
        setSubmitError(t('contact.errorDefault'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SectionContainer>
      <PageHeader
        eyebrow={t('contact.eyebrow')}
        title={t('contact.title')}
        description={t('contact.description')}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-heading-lg">{t('contact.companyName')}</h2>
          <p className="text-body mt-4">{t('contact.companyDescription')}</p>

          <div className="mt-8 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-dark">{t('contact.emailLabel')}</p>
              <a href="mailto:info@aprcrail.com" className="mt-1 inline-block text-arc-text transition hover:text-primary-dark">
                info@aprcrail.com
              </a>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-dark">{t('contact.phoneLabel')}</p>
              <a href="tel:+93798333344" className="mt-1 inline-block text-arc-text transition hover:text-primary-dark">
                +93798333344
              </a>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-dark">{t('contact.locationLabel')}</p>
              <p className="mt-1 text-arc-text">{t('contact.locationValue')}</p>
            </div>
          </div>
        </Card>

        <Card>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <InputField id="name" label={t('contact.name')} value={formData.name} error={formErrors.name} onChange={handleInputChange} />
            <InputField
              id="email"
              label={t('contact.email')}
              type="email"
              value={formData.email}
              error={formErrors.email}
              onChange={handleInputChange}
            />
            <TextAreaField
              id="message"
              label={t('contact.message')}
              value={formData.message}
              error={formErrors.message}
              onChange={handleMessageChange}
            />

            {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
            {successMessage ? <p className="text-sm text-emerald-700">{successMessage}</p> : null}

            <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? t('contact.sending') : t('contact.submit')}
            </Button>

            <p className="text-small">{t('contact.responseNote')}</p>
          </form>
        </Card>
      </div>
    </SectionContainer>
  )
}

export default ContactPage

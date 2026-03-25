import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

export const SUPPORTED_LANGUAGES = ['en', 'fa', 'ps', 'uz'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

const isSupportedLanguage = (value: string | undefined): value is SupportedLanguage =>
  Boolean(value && SUPPORTED_LANGUAGES.includes(value as SupportedLanguage))

export const useLocalizedPath = () => {
  const { lang } = useParams<{ lang: string }>()
  const activeLanguage: SupportedLanguage = isSupportedLanguage(lang) ? lang : 'en'

  const withLang = useMemo(
    () => (path: string) => {
      const normalizedPath = path.startsWith('/') ? path : `/${path}`
      return `/${activeLanguage}${normalizedPath}`
    },
    [activeLanguage],
  )

  return { activeLanguage, withLang }
}

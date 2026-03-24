import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en'
import fa from './locales/fa'
import ps from './locales/ps'
import uz from './locales/uz'

const resources = {
  en: { translation: en },
  fa: { translation: fa },
  ps: { translation: ps },
  uz: { translation: uz },
} as const

const getInitialLanguage = (): 'en' | 'fa' | 'ps' | 'uz' => {
  const stored = localStorage.getItem('arc-lang')
  if (stored === 'en' || stored === 'fa' || stored === 'ps' || stored === 'uz') return stored
  return 'en'
}

void i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

const applyLanguageAttributes = (lng: string): void => {
  const rtlLanguages = ['fa', 'ps']
  document.documentElement.dir = rtlLanguages.includes(lng) ? 'rtl' : 'ltr'
  document.documentElement.lang = lng
}

applyLanguageAttributes(i18n.language)

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('arc-lang', lng)
  applyLanguageAttributes(lng)
})

export default i18n

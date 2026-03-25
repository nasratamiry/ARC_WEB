import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { SUPPORTED_LANGUAGES } from './hooks'
import MainLayout from './layouts/MainLayout'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import HomePage from './pages/HomePage'
import NewsDetailPage from './pages/NewsDetailPage'
import NewsPage from './pages/NewsPage'
import PartnersPage from './pages/PartnersPage'
import PlatformPage from './pages/PlatformPage'
import ServicesPage from './pages/ServicesPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import VerifyResetCodePage from './pages/VerifyResetCodePage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ProfilePage from './pages/ProfilePage'

function LocalizedAppRoutes() {
  const { lang } = useParams<{ lang: string }>()
  const { i18n } = useTranslation()
  const isValidLanguage = SUPPORTED_LANGUAGES.includes((lang ?? '') as (typeof SUPPORTED_LANGUAGES)[number])
  const activeLanguage = isValidLanguage ? (lang as (typeof SUPPORTED_LANGUAGES)[number]) : 'en'

  useEffect(() => {
    if (i18n.language !== activeLanguage) {
      void i18n.changeLanguage(activeLanguage)
    }
  }, [activeLanguage, i18n])

  if (!isValidLanguage) {
    return <Navigate to="/en/" replace />
  }

  return <MainLayout />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/en/" replace />} />
      <Route path="/:lang" element={<LocalizedAppRoutes />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="partners" element={<PartnersPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="news/:slug" element={<NewsDetailPage />} />
        <Route path="platform" element={<PlatformPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="verify-reset-code" element={<VerifyResetCodePage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route
          path="profile"
          element={<ProfilePage />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/en/" replace />} />
    </Routes>
  )
}

export default App

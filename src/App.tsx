import { lazy, Suspense, useEffect } from 'react'
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
import IncotermsPage from './pages/IncotermsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import VerifyResetCodePage from './pages/VerifyResetCodePage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ProfilePage from './pages/ProfilePage'
import ChatPageFallback from './pages/ChatPageFallback'

const ChatPage = lazy(() => import('./pages/ChatPage'))
const ConferencePage = lazy(() => import('./pages/ConferencePage.jsx'))
import ProtectedRoute from './auth/ProtectedRoute'
import ReservationLayout from './pages/reservation/ReservationLayout'
import TrackingPage from './pages/TrackingPage'

const StationsPage = lazy(() => import('./pages/reservation/StationsPage'))
const StationDetailPage = lazy(() => import('./pages/reservation/StationDetailPage'))
const CreateReservationPage = lazy(() => import('./pages/reservation/CreateReservationPage'))
const CargoTrackingEntryPage = lazy(() => import('./pages/reservation/CargoTrackingEntryPage'))
const MyReservationsPage = lazy(() => import('./pages/reservation/MyReservationsPage'))
const ReservationDetailPage = lazy(() => import('./pages/reservation/ReservationDetailPage'))
const PaymentsPage = lazy(() => import('./pages/reservation/PaymentsPage'))

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

function ConferenceJoinRedirect() {
  const { conferenceId } = useParams<{ conferenceId: string }>()
  if (!conferenceId) return <Navigate to="/en/" replace />
  return <Navigate to={`/en/conference/${conferenceId}/join`} replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/en/" replace />} />
      <Route path="/conference/:conferenceId/join" element={<ConferenceJoinRedirect />} />
      <Route path="/:lang" element={<LocalizedAppRoutes />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="incoterms" element={<IncotermsPage />} />
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
        <Route
          path="chat"
          element={
            <Suspense fallback={<ChatPageFallback />}>
              <ChatPage />
            </Suspense>
          }
        />
        <Route
          path="chat/:conversationId"
          element={
            <Suspense fallback={<ChatPageFallback />}>
              <ChatPage />
            </Suspense>
          }
        />
        <Route element={<ProtectedRoute />}>
          <Route
            path="conference"
            element={
              <Suspense fallback={<ChatPageFallback />}>
                <ConferencePage />
              </Suspense>
            }
          />
          <Route
            path="conference/:conferenceId"
            element={
              <Suspense fallback={<ChatPageFallback />}>
                <ConferencePage />
              </Suspense>
            }
          />
          <Route
            path="conference/:conferenceId/join"
            element={
              <Suspense fallback={<ChatPageFallback />}>
                <ConferencePage />
              </Suspense>
            }
          />
          <Route path="reservation" element={<ReservationLayout />}>
            <Route index element={<StationsPage />} />
            <Route path="my" element={<MyReservationsPage />} />
            <Route path="tracking" element={<CargoTrackingEntryPage />} />
            <Route path="create" element={<CreateReservationPage />} />
            <Route path="station/:stationId" element={<StationDetailPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path=":id" element={<ReservationDetailPage />} />
          </Route>
          <Route path="tracking/:code" element={<TrackingPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/en/" replace />} />
    </Routes>
  )
}

export default App

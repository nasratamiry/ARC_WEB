import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useLocalizedPath } from '../../hooks'
import { useAuth } from '../../auth/AuthContext'
import LanguageMenu from './LanguageMenu'

function isHomePath(pathname: string) {
  return /^\/(en|fa|ps|uz)\/?$/.test(pathname)
}

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { t } = useTranslation()
  const location = useLocation()
  const { withLang } = useLocalizedPath()
  const onHero = isHomePath(location.pathname) && !scrolled
  const auth = useAuth()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const navItems = [
    { label: t('nav.home'), to: withLang('/'), end: true },
    { label: t('nav.about'), to: withLang('/about') },
    { label: t('nav.services'), to: withLang('/services') },
    { label: t('nav.partners'), to: withLang('/partners') },
    { label: t('nav.news'), to: withLang('/news') },
    { label: t('nav.platform'), to: withLang('/platform') },
    { label: t('nav.contact'), to: withLang('/contact') },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsOpen(false))
    return () => cancelAnimationFrame(id)
  }, [location.pathname])

  const desktopLink = ({ isActive }: { isActive: boolean }) => {
    if (onHero && !isOpen) {
      return `rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-300 ${
        isActive ? 'text-primary' : 'text-white/90 hover:bg-white/10 hover:text-white'
      }`
    }
    return `rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-300 ${
      isActive ? 'text-primary' : 'text-arc-subtext hover:bg-primary/[0.08] hover:text-arc-text'
    }`
  }

  const mobileLink = ({ isActive }: { isActive: boolean }) => {
    return `block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
      isActive ? 'bg-primary/15 text-primary' : 'text-arc-subtext hover:bg-arc-muted hover:text-arc-text'
    }`
  }

  const shellClass = onHero && !isOpen
    ? 'border-white/10 bg-slate-950/30 shadow-soft backdrop-blur-md'
    : 'border-arc-border/80 bg-white/95 shadow-soft backdrop-blur-md'

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${shellClass}`}>
      <nav className="mx-auto flex w-full max-w-layout items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link
          to={withLang('/')}
          className={`flex items-center gap-3 text-lg font-bold tracking-tight sm:text-xl ${
            onHero && !isOpen ? 'text-white' : 'text-arc-text'
          }`}
        >
          <span className="relative flex h-10 w-10 overflow-hidden rounded-xl ring-2 ring-primary/40">
            <img src="/arc-logo.png" alt="" className="h-full w-full object-cover" />
          </span>
          <span className="hidden sm:inline">{t('nav.brand')}</span>
          <span className="sm:hidden">ARC</span>
        </Link>

        <button
          type="button"
          className={`inline-flex items-center rounded-xl border px-3 py-2 text-sm font-medium transition-colors md:hidden ${
            onHero && !isOpen
              ? 'border-white/30 text-white hover:bg-white/10'
              : 'border-arc-border text-arc-text hover:border-primary hover:text-primary'
          }`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label={t('nav.menu')}
        >
          {isOpen ? '✕' : '☰'}
        </button>

        <div className="hidden items-center gap-2 md:flex">
          <ul className="flex items-center gap-0.5 lg:gap-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className={desktopLink}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <LanguageMenu variant={onHero && !isOpen ? 'hero' : 'light'} />

          {auth.status === 'authenticated' ? (
            <div className="ml-3 flex items-center gap-2">
              <NavLink
                to={withLang('/profile')}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-300 ${
                  onHero && !isOpen ? 'text-white hover:bg-white/10' : 'text-arc-subtext hover:bg-primary/[0.08] hover:text-arc-text'
                }`}
              >
                {t('nav.profile')}
              </NavLink>
              <button
                type="button"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-300 ${
                  onHero && !isOpen ? 'text-white hover:bg-white/10' : 'text-arc-subtext hover:bg-primary/[0.08] hover:text-arc-text'
                }`}
                disabled={isLoggingOut}
                onClick={async () => {
                  setIsLoggingOut(true)
                  try {
                    await auth.logout()
                    navigate(withLang('/login'), { replace: true })
                  } finally {
                    setIsLoggingOut(false)
                  }
                }}
              >
                {isLoggingOut ? t('auth.loggingOut') : t('nav.logout')}
              </button>
            </div>
          ) : (
            <NavLink
              to={withLang('/login')}
              className={`ml-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-300 ${
                onHero && !isOpen ? 'text-white hover:bg-white/10' : 'text-arc-subtext hover:bg-primary/[0.08] hover:text-arc-text'
              }`}
            >
              {t('nav.login')}
            </NavLink>
          )}
        </div>
      </nav>

      <div
        className={`grid border-t border-arc-border/60 bg-white transition-[grid-template-rows] duration-300 ease-out md:hidden ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-3 px-4 py-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.end} className={mobileLink} onClick={() => setIsOpen(false)}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-arc-subtext" htmlFor="mobile-language">
                {t('nav.language')}
              </label>
              <LanguageMenu variant="light" className="w-full" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar

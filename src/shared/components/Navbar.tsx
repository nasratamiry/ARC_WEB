import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useLocalizedPath } from '../../hooks'
import { useAuth } from '../../auth/AuthContext'
import { CircleUserRound, X } from 'lucide-react'
import LanguageMenu from './LanguageMenu'

function isHomePath(pathname: string) {
  return /^\/(en|fa|ps|uz)\/?$/.test(pathname)
}

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const { withLang } = useLocalizedPath()
  const onHero = isHomePath(location.pathname) && !scrolled
  const auth = useAuth()
  const activeLang = (i18n.resolvedLanguage || i18n.language || '').toLowerCase()
  const isUzbek = activeLang.startsWith('uz')
  const isRtl = i18n.dir() === 'rtl'

  const navItems = [
    { label: t('nav.home'), to: withLang('/'), end: true },
    { label: t('nav.about'), to: withLang('/about') },
    { label: t('nav.services'), to: withLang('/services') },
    { label: t('nav.incoterms'), to: withLang('/incoterms') },
    { label: t('nav.partners'), to: withLang('/partners') },
    { label: t('nav.news'), to: withLang('/news') },
    { label: t('nav.reservation'), to: withLang('/reservation') },
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
    setIsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  const desktopLink = ({ isActive }: { isActive: boolean }) => {
    const underlineBase = `relative rounded-xl ${isUzbek ? 'px-2 py-2 text-xs lg:px-2.5' : 'px-2.5 py-2 text-sm lg:px-3'} font-medium transition-all duration-300 after:absolute after:inset-x-2 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:opacity-0 after:shadow-[0_0_10px_rgba(0,226,255,0.45)] after:transition-all after:duration-300 hover:after:scale-x-100 hover:after:opacity-100 lg:after:inset-x-3`
    if (onHero && !isOpen) {
      return `${underlineBase} ${
        isActive ? 'text-primary after:scale-x-100 after:opacity-100' : 'text-white/90 hover:text-primary'
      }`
    }
    return `${underlineBase} ${
      isActive ? 'text-primary after:scale-x-100 after:opacity-100' : 'text-arc-subtext hover:text-primary'
    }`
  }

  const mobileLink = ({ isActive }: { isActive: boolean }) => {
    return `flex min-h-11 items-center rounded-xl px-4 py-2.5 text-base font-medium transition-colors duration-200 ${
      isActive ? 'bg-primary/15 text-primary' : 'text-arc-subtext hover:bg-arc-muted hover:text-arc-text'
    }`
  }

  const shellClass =
    onHero && !isOpen
      ? 'border-white/10 bg-slate-950/30 shadow-soft backdrop-blur-md'
      : 'border-arc-border/80 bg-white/95 shadow-soft backdrop-blur-md'

  const drawerTransform =
    isRtl
      ? isOpen
        ? 'translate-x-0'
        : '-translate-x-full'
      : isOpen
        ? 'translate-x-0'
        : 'translate-x-full'

  const drawerSideClass = isRtl ? 'left-0' : 'right-0'

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${shellClass}`}>
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to={withLang('/')} className="md:hidden">
          <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-xl ring-2 ring-primary/40">
            <img src="/arc-logo.png" alt="ARC" className="h-full w-full object-cover" />
          </span>
        </Link>
        <button
          type="button"
          className={`inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border px-3 text-sm font-medium transition-colors md:hidden ${
            onHero && !isOpen
              ? 'border-white/30 text-white hover:bg-white/10'
              : 'border-arc-border text-arc-text hover:border-primary hover:text-primary'
          }`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="mobile-nav-drawer"
          aria-label={t('nav.menu')}
        >
          {isOpen ? <X className="h-5 w-5" aria-hidden /> : '☰'}
        </button>

        <div className="hidden w-full grid-cols-[auto_1fr_auto] items-center gap-2 md:grid lg:gap-3">
          <div className={`order-3 flex items-center justify-end ${isUzbek ? 'gap-1' : 'gap-2'}`}>
            <LanguageMenu
              variant={onHero && !isOpen ? 'hero' : 'light'}
              iconOnly
              className={`transition-colors duration-300 ${
                onHero && !isOpen ? 'text-white/90 hover:text-primary' : 'text-arc-subtext hover:text-primary'
              }`}
            />
            {auth.status === 'authenticated' ? (
              <Link
                to={withLang('/profile')}
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                  onHero && !isOpen
                    ? 'border-white/30 text-white hover:border-primary/70 hover:text-primary'
                    : 'border-arc-border text-arc-text hover:border-primary hover:text-primary'
                }`}
                aria-label={t('nav.profile')}
              >
                <CircleUserRound className="h-5 w-5" aria-hidden />
              </Link>
            ) : (
              <Link
                to={withLang('/login')}
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                  onHero && !isOpen
                    ? 'border-white/30 text-white hover:border-primary/70 hover:text-primary'
                    : 'border-arc-border text-arc-text hover:border-primary hover:text-primary'
                }`}
                aria-label={t('nav.login')}
              >
                <CircleUserRound className="h-5 w-5" aria-hidden />
              </Link>
            )}
          </div>

          <ul
            className={`order-2 mx-auto flex min-w-0 max-w-full flex-wrap items-center justify-center ${isUzbek ? 'gap-0 lg:gap-0.5' : 'gap-0.5 lg:gap-1'}`}
          >
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className={desktopLink}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <Link to={withLang('/')} className="order-1 inline-flex shrink-0 justify-start" aria-label={t('nav.home')}>
            <span className="relative flex h-10 w-10 overflow-hidden rounded-xl ring-2 ring-primary/40">
              <img src="/arc-logo.png" alt="ARC" className="h-full w-full object-cover" />
            </span>
          </Link>
        </div>
      </nav>

      {isOpen ? (
        <div className="md:hidden">
          <button
            type="button"
            className="fixed inset-0 z-[55] bg-slate-900/45 backdrop-blur-[2px]"
            aria-label={t('nav.closeMenu')}
            onClick={() => setIsOpen(false)}
          />
          <div
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.menu')}
            className={`fixed inset-y-0 z-[60] flex w-full max-w-[min(20rem,calc(100vw-3rem))] flex-col border-arc-border/80 bg-white shadow-xl transition-transform duration-300 ease-out ${drawerSideClass} ${drawerTransform}`}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between gap-3 border-b border-arc-border/70 px-4 py-3">
              <span className="text-sm font-semibold uppercase tracking-widest text-arc-subtext">{t('nav.menu')}</span>
              <button
                type="button"
                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-arc-border text-arc-text transition hover:border-primary hover:text-primary"
                onClick={() => setIsOpen(false)}
                aria-label={t('nav.closeMenu')}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-3">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.to}>
                    <NavLink to={item.to} end={item.end} className={mobileLink} onClick={() => setIsOpen(false)}>
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="border-t border-arc-border/70 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-arc-subtext">{t('nav.language')}</p>
              <LanguageMenu variant="light" className="w-full [&>button]:!min-h-11" />
              <div className="mt-3">
                {auth.status === 'authenticated' ? (
                  <Link
                    to={withLang('/profile')}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-arc-border px-4 text-sm font-semibold text-arc-text transition hover:border-primary hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    <CircleUserRound className="h-5 w-5" aria-hidden />
                    {t('nav.profile')}
                  </Link>
                ) : (
                  <Link
                    to={withLang('/login')}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-arc-border px-4 text-sm font-semibold text-arc-text transition hover:border-primary hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    <CircleUserRound className="h-5 w-5" aria-hidden />
                    {t('nav.login')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}

export default Navbar

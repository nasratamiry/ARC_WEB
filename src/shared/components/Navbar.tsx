import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router-dom'

const languages = [
  { code: 'en', label: 'English' },
  { code: 'fa', label: 'دری' },
  { code: 'ps', label: 'پښتو' },
  { code: 'uz', label: 'Oʻzbekcha' },
] as const

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { t, i18n } = useTranslation()
  const navItems = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.about'), to: '/about' },
    { label: t('nav.services'), to: '/services' },
    { label: t('nav.partners'), to: '/partners' },
    { label: t('nav.news'), to: '/news' },
    { label: t('nav.platform'), to: '/platform' },
    { label: t('nav.contact'), to: '/contact' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-arc-border bg-white/95 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-layout items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-lg font-bold tracking-tight text-arc-text sm:text-xl">
          <img src="/arc-logo.png" alt="ARC logo" className="h-10 w-10 rounded-lg object-cover" />
          <span className="hidden sm:inline">{t('nav.brand')}</span>
          <span className="sm:hidden">ARC</span>
        </Link>

        <button
          type="button"
          className="inline-flex items-center rounded-xl border border-arc-border px-3 py-2 text-sm text-arc-text transition-colors hover:border-primary hover:text-primary md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label="Toggle menu"
        >
          {t('nav.menu')}
        </button>

        <div className="hidden items-center gap-2 md:flex">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-primary-dark'
                        : 'text-arc-subtext hover:bg-arc-muted hover:text-arc-text'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <label className="sr-only" htmlFor="desktop-language">
            {t('nav.language')}
          </label>
          <select
            id="desktop-language"
            value={i18n.language}
            onChange={(event) => void i18n.changeLanguage(event.target.value)}
            className="rounded-xl border border-arc-border bg-white px-3 py-2 text-sm text-arc-text outline-none transition focus:border-primary"
          >
            {languages.map((language) => (
              <option key={language.code} value={language.code}>
                {language.label}
              </option>
            ))}
          </select>
        </div>
      </nav>

      {isOpen && (
        <div className="space-y-3 border-t border-arc-border bg-white px-4 py-3 md:hidden">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `block rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary-dark'
                        : 'text-arc-subtext hover:bg-arc-muted hover:text-arc-text'
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-arc-subtext" htmlFor="mobile-language">
              {t('nav.language')}
            </label>
            <select
              id="mobile-language"
              value={i18n.language}
              onChange={(event) => void i18n.changeLanguage(event.target.value)}
              className="w-full rounded-xl border border-arc-border bg-white px-3 py-2 text-sm text-arc-text outline-none transition focus:border-primary"
            >
              {languages.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocalizedPath } from '../../hooks'
import LanguageMenu from './LanguageMenu'

function IconLinkedIn({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function Footer() {
  const { t } = useTranslation()
  const { withLang } = useLocalizedPath()
  const quickLinks = [
    { label: t('nav.home'), to: withLang('/') },
    { label: t('nav.about'), to: withLang('/about') },
    { label: t('nav.services'), to: withLang('/services') },
    { label: t('nav.platform'), to: withLang('/platform') },
    { label: t('nav.news'), to: withLang('/news') },
    { label: t('nav.contact'), to: withLang('/contact') },
  ]

  const social = [
    { href: 'https://www.linkedin.com', label: 'LinkedIn', Icon: IconLinkedIn },
    { href: 'https://x.com', label: 'X', Icon: IconX },
    { href: 'https://www.facebook.com', label: 'Facebook', Icon: IconFacebook },
  ]

  return (
    <footer className="relative mt-auto border-t border-white/10 bg-[#030b14] text-slate-400">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
        aria-hidden
      />
      <div className="mx-auto grid w-full max-w-layout gap-12 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8">
        <div className="lg:col-span-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl ring-1 ring-primary/40">
              <img src="/arc-logo.png" alt="" className="h-full w-full object-cover" />
            </span>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">{t('footer.aboutTitle')}</p>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-400">{t('footer.aboutText')}</p>
          <div className="mt-6 flex gap-3">
            {social.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition-all duration-300 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">{t('footer.quickLinks')}</h3>
          <ul className="mt-5 space-y-2.5">
            {quickLinks.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-sm text-slate-400 transition-colors duration-200 hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">{t('footer.contact')}</h3>
          <ul className="mt-5 space-y-2.5 text-sm leading-7">
            <li className="flex gap-2">
              <span className="text-primary" aria-hidden>
                ●
              </span>
              <span>{t('footer.location')}</span>
            </li>
            <li>
              <a href="mailto:info@aprcrail.com" className="transition-colors hover:text-primary">
                info@aprcrail.com
              </a>
            </li>
            <li>
              <a href="tel:+93798333344" className="transition-colors hover:text-primary" dir="ltr">
                +93 798 333 344
              </a>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">{t('nav.language')}</h3>
          <div className="mt-4">
            <LanguageMenu variant="dark" className="w-full" />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto w-full max-w-layout px-4 py-5 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} {t('footer.rights')}
        </p>
      </div>
    </footer>
  )
}

export default Footer

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocalizedPath } from '../../hooks'
import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react'
import LanguageMenu from './LanguageMenu'

function IconApple({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M15.7 2.2c0 1-.36 1.9-.96 2.57-.66.73-1.75 1.3-2.8 1.22-.13-.95.39-1.9.98-2.54.65-.73 1.8-1.24 2.78-1.25zM20.9 16.95c-.48 1.1-.72 1.58-1.35 2.57-.88 1.39-2.13 3.13-3.68 3.15-1.38.02-1.73-.88-3.59-.87-1.86.01-2.26.9-3.64.88-1.55-.02-2.75-1.58-3.64-2.96-2.5-3.94-2.77-8.57-1.23-10.94 1.09-1.67 2.8-2.65 4.41-2.65 1.64 0 2.68.9 4.03.9 1.31 0 2.11-.9 4.02-.9 1.44 0 2.97.79 4.05 2.15-3.52 1.95-2.95 7.12.62 8.67z" />
    </svg>
  )
}

function IconGooglePlay({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M2.8 2.4 13.5 12 2.8 21.6c-.37-.4-.6-.96-.6-1.62V4.02c0-.66.23-1.22.6-1.62z" fill="#00A8FF" />
      <path d="m16.9 15.2-3.4-3.2 3.4-3.2 4.1 2.3c1 .56 1 1.46 0 2.02l-4.1 2.3z" fill="#00D17B" />
      <path d="M16.9 15.2 5.3 21.88c-.97.55-1.8.46-2.5-.28L13.5 12l3.4 3.2z" fill="#FFC107" />
      <path d="M16.9 8.8 13.5 12 2.8 2.4c.7-.74 1.53-.83 2.5-.28L16.9 8.8z" fill="#FF4D67" />
    </svg>
  )
}

function Footer() {
  const { t, i18n } = useTranslation()
  const { withLang } = useLocalizedPath()
  const isRtl = i18n.dir() === 'rtl'
  const appStoreUrl = 'https://apps.apple.com/cy/app/afghanistan-railway-consortium/id6759148531'
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.arc.arc'
  const etihadUrl = 'https://etihadamu.com/en'
  const appleMapsPlaceUrl =
    'https://maps.apple.com/place?address=Street%205,%20Kabul,%20Afghanistan&coordinate=34.539131,69.181473&name=Street%205&map=explore'
  const whatsAppUrl = 'https://wa.me/93798333344'
  const quickLinksMain = [
    { label: t('nav.home'), to: withLang('/') },
    { label: t('nav.about'), to: withLang('/about') },
    { label: t('nav.services'), to: withLang('/services') },
    { label: t('nav.partners'), to: withLang('/partners') },
  ]
  const quickLinksPlatform = [
    { label: t('nav.platform'), to: withLang('/platform') },
    { label: t('nav.news'), to: withLang('/news') },
    { label: t('nav.reservation'), to: withLang('/reservation') },
    { label: t('nav.contact'), to: withLang('/contact') },
  ]

  const footerSectionTitle = 'text-sm font-bold uppercase tracking-widest text-white leading-snug'

  return (
    <footer className="relative mt-auto border-t border-white/10 bg-[#030b14] text-slate-400">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
        aria-hidden
      />
      <div dir={isRtl ? 'rtl' : 'ltr'} className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:gap-12 sm:px-6 sm:py-14 lg:grid-cols-12 lg:gap-10 lg:px-8">
        <div className="lg:col-span-3">
          <div className={`flex items-center gap-3 ${isRtl ? 'justify-start' : ''}`}>
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl ring-1 ring-primary/40">
              <img src="/arc-logo.png" alt="" className="h-full w-full object-cover" />
            </span>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">{t('footer.aboutTitle')}</p>
          </div>
          <p className="mt-4 overflow-hidden text-sm leading-7 text-slate-400 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
            {t('footer.aboutText')}
          </p>
          <div className="mt-3 w-full">
            <LanguageMenu
              anchorFullWidth
              variant="dark"
              menuAlign="bottom-center"
              className="[&_.language-menu-trigger-frame]:rounded-xl [&_.language-menu-trigger-frame]:border [&_.language-menu-trigger-frame]:border-slate-600 [&_.language-menu-trigger-frame]:bg-slate-900/50 [&_.language-menu-trigger-frame]:p-1 [&_.language-menu-trigger-frame]:transition-colors [&_.language-menu-trigger-frame]:hover:border-slate-500 [&_.language-menu-trigger-frame]:hover:shadow-glow [&_.language-menu-trigger-frame>button]:!w-full [&_.language-menu-trigger-frame>button]:!min-h-9 [&_.language-menu-trigger-frame>button]:!justify-between [&_.language-menu-trigger-frame>button]:!gap-2 [&_.language-menu-trigger-frame>button]:!rounded-lg [&_.language-menu-trigger-frame>button]:!border-0 [&_.language-menu-trigger-frame>button]:!bg-transparent [&_.language-menu-trigger-frame>button]:!px-3 [&_.language-menu-trigger-frame>button]:!py-2 [&_.language-menu-trigger-frame>button]:!text-xs [&_.language-menu-trigger-frame>button]:!shadow-none"
            />
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="grid items-start gap-6 sm:grid-cols-2">
            <div>
              <h4 className={footerSectionTitle}>{t('footer.linkGroupCompany')}</h4>
              <ul className="mt-3 space-y-2.5">
                {quickLinksMain.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors duration-200 hover:text-primary"
                    >
                      <span className="h-1 w-1 rounded-full bg-primary/60" aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className={`whitespace-nowrap ${footerSectionTitle}`}>{t('footer.linkGroupPlatform')}</h4>
              <ul className="mt-3 space-y-2.5">
                {quickLinksPlatform.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors duration-200 hover:text-primary"
                    >
                      <span className="h-1 w-1 rounded-full bg-primary/60" aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h3 className={footerSectionTitle}>{t('footer.contact')}</h3>
          <ul className="mt-5 space-y-2.5 text-sm leading-7">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <a
                href={appleMapsPlaceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-primary"
              >
                {t('footer.location')}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <a href="mailto:info@aprcrail.com" className="transition-colors hover:text-primary">
                info@aprcrail.com
              </a>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-primary"
                dir="ltr"
              >
                +93 798 333 344
              </a>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className={`mb-3 ${footerSectionTitle}`}>{t('footer.downloadApps')}</h3>
          <div className="ml-auto w-full max-w-md space-y-3">
            <a
              href={appStoreUrl}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex w-full items-center justify-between rounded-xl border border-white/15 bg-black px-5 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-glow"
            >
              <div className={`flex items-center gap-2.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white">
                  <IconApple className="h-5 w-5" />
                </span>
                <span className={isRtl ? 'text-right' : 'text-left'}>
                  <span className="block text-[10px] uppercase tracking-wider text-slate-400">Download on the</span>
                  <span className="block text-[15px] font-semibold text-white">App Store</span>
                </span>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-slate-500 transition-colors group-hover:text-primary" aria-hidden />
            </a>
            <a
              href={playStoreUrl}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex w-full items-center justify-between rounded-xl border border-white/15 bg-black px-5 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-glow"
            >
              <div className={`flex items-center gap-2.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                  <IconGooglePlay className="h-5 w-5" />
                </span>
                <span className={isRtl ? 'text-right' : 'text-left'}>
                  <span className="block text-[10px] uppercase tracking-wider text-slate-400">Get it on</span>
                  <span className="block text-[15px] font-semibold text-white">Google Play</span>
                </span>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-slate-500 transition-colors group-hover:text-primary" aria-hidden />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto w-full max-w-7xl px-4 py-5 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} {t('footer.rights')} · {t('footer.designedBy')}{' '}
          <a href={etihadUrl} target="_blank" rel="noreferrer" className="font-semibold text-primary transition-colors hover:text-primary-light">
            {t('footer.etihadName')}
          </a>
        </p>
      </div>
    </footer>
  )
}

export default Footer

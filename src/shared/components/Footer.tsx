import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function Footer() {
  const { t } = useTranslation()
  const quickLinks = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.about'), to: '/about' },
    { label: t('nav.services'), to: '/services' },
    { label: t('nav.platform'), to: '/platform' },
    { label: t('nav.news'), to: '/news' },
    { label: t('nav.contact'), to: '/contact' },
  ]

  return (
    <footer className="border-t border-arc-border bg-white">
      <div className="mx-auto grid w-full max-w-layout gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-arc-text">{t('footer.aboutTitle')}</h3>
          <p className="text-small mt-3">{t('footer.aboutText')}</p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-arc-text">{t('footer.quickLinks')}</h3>
          <ul className="mt-3 space-y-2">
            {quickLinks.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-small transition-colors hover:text-primary-dark">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-arc-text">{t('footer.contact')}</h3>
          <ul className="text-small mt-3 space-y-2">
            <li>{t('footer.location')}</li>
            <li>info@arc.af</li>
            <li>+93 000 000 000</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-arc-border">
        <p className="mx-auto w-full max-w-layout px-4 py-4 text-xs text-arc-subtext sm:px-6 lg:px-8">
          © {new Date().getFullYear()} {t('footer.rights')}
        </p>
      </div>
    </footer>
  )
}

export default Footer

import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { SUPPORTED_LANGUAGES, useLocalizedPath } from '../../hooks'

type SeoProps = {
  title: string
  description: string
}

function Seo({ title, description }: SeoProps) {
  const location = useLocation()
  const { activeLanguage } = useLocalizedPath()
  const origin = window.location.origin
  const currentPath = location.pathname + location.search
  const canonicalUrl = `${origin}${currentPath}`
  const urlWithoutLang = location.pathname.replace(/^\/(en|fa|ps|uz)/, '')
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Afghanistan Railway Consortium (ARC)',
    url: origin,
    logo: `${origin}/arc-logo.png`,
    sameAs: ['https://www.linkedin.com', 'https://x.com', 'https://www.facebook.com'],
  }
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: canonicalUrl,
    inLanguage: activeLanguage,
  }

  return (
    <Helmet>
      <title>{`${title} | ARC - Afghanistan Railway Consortium`}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="ARC - Afghanistan Railway Consortium" />
      <meta property="og:image" content={`${origin}/arc-logo.png`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${origin}/arc-logo.png`} />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={`${origin}/en${urlWithoutLang || '/'}`} />
      {SUPPORTED_LANGUAGES.map((language) => (
        <link key={language} rel="alternate" hrefLang={language} href={`${origin}/${language}${urlWithoutLang || '/'}`} />
      ))}
      <meta name="language" content={activeLanguage} />
      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(pageSchema)}</script>
    </Helmet>
  )
}

export default Seo

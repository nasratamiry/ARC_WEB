import { Link } from 'react-router-dom'
import { useLatestNews } from '../hooks'
import { Badge, Button, Card, HeroSection, PageHeader, SectionContainer } from '../shared/ui'
import { useTranslation } from 'react-i18next'

function HomePage() {
  const { t } = useTranslation()
  const { data: latestNews, loading: latestNewsLoading, error: latestNewsError } = useLatestNews()
  const aboutHighlights = [
    t('home.aboutHighlight1'),
    t('home.aboutHighlight2'),
    t('home.aboutHighlight3'),
  ]

  const servicePreview = [
    {
      title: t('home.service1Title'),
      description: t('home.service1Description'),
    },
    {
      title: t('home.service2Title'),
      description: t('home.service2Description'),
    },
    {
      title: t('home.service3Title'),
      description: t('home.service3Description'),
    },
  ]

  return (
    <>
      <HeroSection
        eyebrowLabel={t('home.heroEyebrow')}
        title={t('home.heroTitle')}
        subtitle={t('home.heroSubtitle')}
        ctaLabel={t('home.heroCta')}
        backgroundImageBaseUrl="/hero-train"
      />

      <SectionContainer className="pt-10">
        <PageHeader
          eyebrow={t('home.aboutEyebrow')}
          title={t('home.aboutTitle')}
          description={t('home.aboutDescription')}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {aboutHighlights.map((highlight) => (
            <Card key={highlight}>
              <Badge>{t('home.aboutBadge')}</Badge>
              <p className="text-body mt-4">{highlight}</p>
            </Card>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer className="pt-4">
        <PageHeader
          eyebrow={t('home.servicesEyebrow')}
          title={t('home.servicesTitle')}
          description={t('home.servicesDescription')}
          actions={<Button variant="outline">{t('home.servicesAction')}</Button>}
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {servicePreview.map((service) => (
            <Card key={service.title}>
              <h3 className="text-xl font-semibold text-arc-text">{service.title}</h3>
              <p className="text-body mt-3">{service.description}</p>
            </Card>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer className="pt-4">
        <PageHeader
          eyebrow={t('home.latestEyebrow')}
          title={t('home.latestTitle')}
          description={t('home.latestDescription')}
        />

        {latestNewsLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={`home-news-loading-${index}`} className="animate-pulse overflow-hidden p-0">
                <div className="h-44 bg-arc-muted" />
                <div className="p-6">
                  <div className="h-6 w-5/6 rounded bg-arc-muted" />
                  <div className="mt-3 h-4 w-full rounded bg-arc-muted" />
                  <div className="mt-2 h-4 w-2/3 rounded bg-arc-muted" />
                </div>
              </Card>
            ))}
          </div>
        ) : null}

        {latestNewsError && !latestNewsLoading ? (
          <Card>
            <p className="text-body text-red-600">{latestNewsError}</p>
          </Card>
        ) : null}

        {!latestNewsLoading && !latestNewsError ? (
          <div className="grid gap-6 md:grid-cols-3">
            {latestNews.map((item) => (
              <Link key={item.slug} to={`/news/${item.slug}`} className="group block">
                <Card className="h-full overflow-hidden p-0 transition-shadow group-hover:shadow-soft">
                  <div className="h-44 bg-arc-muted">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-arc-text transition-colors group-hover:text-primary-dark">
                      {item.title}
                    </h3>
                    <p className="text-body mt-3 line-clamp-3">{item.excerpt}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : null}
      </SectionContainer>
    </>
  )
}

export default HomePage

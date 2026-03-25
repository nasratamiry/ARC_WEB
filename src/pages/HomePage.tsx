import { useMemo } from 'react'
import { useLatestNews, useLocalizedPath, usePartners } from '../hooks'
import Seo from '../shared/components/Seo'
import {
  Badge,
  Button,
  Card,
  HeroCarousel,
  NewsSectionSlider,
  PageHeader,
  PartnersMarquee,
  SectionContainer,
} from '../shared/ui'
import type { HeroSlide } from '../shared/ui/HeroCarousel'
import { useTranslation } from 'react-i18next'

function HomePage() {
  const { t } = useTranslation()
  const { withLang } = useLocalizedPath()
  const { data: latestNews, loading: latestNewsLoading, error: latestNewsError } = useLatestNews()
  const { data: partners, loading: partnersLoading, error: partnersError } = usePartners()

  const heroSlides: HeroSlide[] = useMemo(
    () => [
      {
        id: 's1',
        eyebrow: t('home.heroEyebrow'),
        title: t('home.heroTitle'),
        subtitle: t('home.heroSubtitle'),
        ctaLabel: t('home.heroCta'),
        ctaTo: withLang('/services'),
        image: '/hero-slide-1.png',
        overlay: 'dark',
      },
      {
        id: 's2',
        eyebrow: t('home.heroSlide2Eyebrow'),
        title: t('home.heroSlide2Title'),
        subtitle: t('home.heroSlide2Subtitle'),
        ctaLabel: t('home.heroSlide2Cta'),
        ctaTo: withLang('/partners'),
        image: '/hero-slide-2.png',
        overlay: 'dark',
      },
      {
        id: 's3',
        eyebrow: t('home.heroSlide3Eyebrow'),
        title: t('home.heroSlide3Title'),
        subtitle: t('home.heroSlide3Subtitle'),
        ctaLabel: t('home.heroSlide3Cta'),
        ctaTo: withLang('/contact'),
        image: '/hero-slide-3.png',
        overlay: 'dark',
      },
    ],
    [t, withLang],
  )

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
      <Seo title={t('nav.home')} description={t('home.heroSubtitle')} />
      <HeroCarousel slides={heroSlides} />

      <SectionContainer className="pt-8" variant="muted">
        <PageHeader
          titleAs="h2"
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

      <SectionContainer variant="tint">
        <PageHeader
          titleAs="h2"
          eyebrow={t('home.servicesEyebrow')}
          title={t('home.servicesTitle')}
          description={t('home.servicesDescription')}
          actions={<Button to={withLang('/services')} variant="secondary">{t('home.servicesAction')}</Button>}
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {servicePreview.map((service) => (
            <Card key={service.title}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M4 19h16M4 15l4-8 4 5 4-9 4 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-arc-text">{service.title}</h3>
              <p className="text-body mt-3">{service.description}</p>
            </Card>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer>
        <PageHeader
          titleAs="h2"
          eyebrow={t('partners.eyebrow')}
          title={t('partners.title')}
          description={t('partners.description')}
        />

        {partnersLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={`partner-home-loading-${index}`} className="animate-pulse">
                <div className="h-12 w-28 rounded bg-arc-muted" />
                <div className="mt-3 h-4 w-4/5 rounded bg-arc-muted" />
              </Card>
            ))}
          </div>
        ) : null}

        {partnersError && !partnersLoading ? (
          <Card>
            <p className="text-body text-red-600">{partnersError}</p>
          </Card>
        ) : null}

        {!partnersLoading && !partnersError && partners ? <PartnersMarquee partners={partners} /> : null}
      </SectionContainer>

      <SectionContainer variant="muted" className="pb-20">
        <PageHeader
          titleAs="h2"
          eyebrow={t('home.latestEyebrow')}
          title={t('home.latestTitle')}
          description={t('home.latestDescription')}
          actions={<Button to={withLang('/news')} variant="secondary">{t('home.latestAction')}</Button>}
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

        {!latestNewsLoading && !latestNewsError && latestNews && latestNews.length > 0 ? (
          <NewsSectionSlider items={latestNews} buildPath={(slug) => withLang(`/news/${slug}`)} />
        ) : null}
      </SectionContainer>
    </>
  )
}

export default HomePage

import { useMemo } from 'react'
import { Activity, Boxes, ShieldCheck } from 'lucide-react'
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
        secondaryCtaLabel: t('nav.platform'),
        secondaryCtaTo: withLang('/platform'),
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
        secondaryCtaLabel: t('nav.contact'),
        secondaryCtaTo: withLang('/contact'),
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
        secondaryCtaLabel: t('nav.services'),
        secondaryCtaTo: withLang('/services'),
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
      Icon: Activity,
    },
    {
      title: t('home.service2Title'),
      description: t('home.service2Description'),
      Icon: Boxes,
    },
    {
      title: t('home.service3Title'),
      description: t('home.service3Description'),
      Icon: ShieldCheck,
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
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
          actions={
            <Button to={withLang('/services')} variant="secondary">
              {t('home.servicesAction')}
            </Button>
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {servicePreview.map((service) => (
            <Card key={service.title}>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary shadow-soft">
                  <service.Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="text-xl font-semibold tracking-tight text-arc-text">{service.title}</h3>
              </div>
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
          actions={
            <Button to={withLang('/news')} variant="secondary">
              {t('home.latestAction')}
            </Button>
          }
        />

        {latestNewsLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
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

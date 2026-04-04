import {
  ArrowRight,
  Boxes,
  ChartColumnIncreasing,
  Compass,
  Globe2,
  Handshake,
  Lightbulb,
  ShieldCheck,
  TrainFront,
  TrendingDown,
  Truck,
} from 'lucide-react'
import { Button, Card, SectionContainer } from '../shared/ui'
import { useTranslation } from 'react-i18next'
import Seo from '../shared/components/Seo'
import { useLocalizedPath } from '../hooks'

function AboutPage() {
  const { t } = useTranslation()
  const { withLang } = useLocalizedPath()

  const values = t('aboutModern.values', { returnObjects: true }) as Array<{ title: string; text: string }>
  const services = t('aboutModern.services', { returnObjects: true }) as Array<{ title: string; text: string }>
  const impact = t('aboutModern.impact', { returnObjects: true }) as Array<{ value: string; label: string }>
  const valueIcons = [ShieldCheck, Lightbulb, ChartColumnIncreasing, Handshake]
  const serviceIcons = [TrainFront, Truck, Globe2, Compass]
  const impactIcons = [Globe2, TrainFront, TrendingDown, Boxes]

  return (
    <SectionContainer>
      <Seo
        title={t('nav.about')}
        description={t('aboutModern.heroDescription')}
      />

      <section className="animate-fade-in">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{t('aboutModern.heroEyebrow')}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-arc-text sm:text-5xl">{t('aboutModern.heroTitle')}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-arc-subtext">
          {t('aboutModern.heroDescription')}
        </p>
      </section>

      <section className="mt-10">
        <Card>
          <h2 className="text-2xl font-semibold tracking-tight text-arc-text">{t('aboutModern.whoTitle')}</h2>
          <p className="mt-3 max-w-3xl text-body">
            {t('aboutModern.whoDescription')}
          </p>
        </Card>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
              <TrainFront className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-arc-text">{t('aboutModern.missionTitle')}</h2>
          </div>
          <p className="text-body mt-4">
            {t('aboutModern.missionDescription')}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
              <Globe2 className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-arc-text">{t('aboutModern.visionTitle')}</h2>
          </div>
          <p className="text-body mt-4">
            {t('aboutModern.visionDescription')}
          </p>
        </Card>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold tracking-tight text-arc-text">{t('aboutModern.valuesTitle')}</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((item, idx) => {
            const Icon = valueIcons[idx] ?? ShieldCheck
            return (
            <Card key={item.title} className="hover:-translate-y-1.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-arc-text">{item.title}</h3>
              <p className="mt-2 text-small">{item.text}</p>
            </Card>
          )})}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold tracking-tight text-arc-text">{t('aboutModern.servicesTitle')}</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((item, idx) => {
            const Icon = serviceIcons[idx] ?? TrainFront
            return (
            <Card key={item.title} className="hover:-translate-y-1.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-arc-text">{item.title}</h3>
              <p className="mt-2 text-small">{item.text}</p>
            </Card>
          )})}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold tracking-tight text-arc-text">{t('aboutModern.impactTitle')}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {impact.map((item, idx) => {
            const Icon = impactIcons[idx] ?? Globe2
            return (
            <Card key={`${item.value}-${item.label}`} className="text-center">
              <Icon className="mx-auto h-6 w-6 text-primary" aria-hidden />
              <p className="mt-4 text-2xl font-bold text-arc-text">{item.value}</p>
              <p className="mt-1 text-small">{item.label}</p>
            </Card>
          )})}
        </div>
      </section>

      <section className="mt-10">
        <Card className="border-primary/20 bg-primary/[0.06]">
          <h2 className="text-2xl font-semibold tracking-tight text-arc-text">{t('aboutModern.ctaTitle')}</h2>
          <p className="text-body mt-3">
            {t('aboutModern.ctaDescription')}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button to={withLang('/signup')} variant="primary">
              {t('aboutModern.joinPlatform')}
            </Button>
            <Button to={withLang('/platform')} variant="secondary" className="group">
              <span>{t('aboutModern.trackShipment')}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
            </Button>
          </div>
        </Card>
      </section>
    </SectionContainer>
  )
}

export default AboutPage

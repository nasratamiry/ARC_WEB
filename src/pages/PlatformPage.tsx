import { Badge, Button, Card, PageHeader, SectionContainer } from '../shared/ui'
import { useTranslation } from 'react-i18next'
import Seo from '../shared/components/Seo'
import { CheckCircle2, Clock, Route, Shield, Sparkles, TrendingUp } from 'lucide-react'
import { useLocalizedPath } from '../hooks'
import { useAuth } from '../auth/AuthContext'

function PlatformPage() {
  const { t } = useTranslation()
  const { withLang } = useLocalizedPath()
  const auth = useAuth()
  const features = [
    t('platform.feature1'),
    t('platform.feature2'),
    t('platform.feature3'),
    t('platform.feature4'),
  ]

  const benefits = [
    t('platform.benefit1'),
    t('platform.benefit2'),
    t('platform.benefit3'),
    t('platform.benefit4'),
  ]

  const howItWorks = [
    {
      title: t('platform.step1Title'),
      description: t('platform.step1Description'),
      Icon: Sparkles,
    },
    {
      title: t('platform.step2Title'),
      description: t('platform.step2Description'),
      Icon: Route,
    },
    {
      title: t('platform.step3Title'),
      description: t('platform.step3Description'),
      Icon: CheckCircle2,
    },
  ]

  const highlights = [
    { title: t('platform.features'), Icon: TrendingUp },
    { title: t('platform.benefits'), Icon: Shield },
    { title: t('platform.howItWorks'), Icon: Clock },
  ]

  return (
    <SectionContainer>
      <Seo title={t('nav.platform')} description={t('platform.description')} />
      <PageHeader
        eyebrow={t('platform.eyebrow')}
        title={t('platform.title')}
        description={t('platform.description')}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {auth.status !== 'authenticated' ? (
              <Button to={withLang('/signup')} variant="primary">
                {t('nav.signup')}
              </Button>
            ) : null}
            <Button to={withLang('/contact')} variant="secondary">
              {t('nav.contact')}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <Badge>{t('platform.features')}</Badge>
          <ul className="mt-5 space-y-3.5">
            {features.map((feature) => (
              <li key={feature} className="flex gap-3 text-body">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {highlights.map((h) => (
              <div
                key={h.title}
                className="flex flex-col items-start gap-2 rounded-2xl border border-primary/15 bg-primary/5 p-4"
              >
                <h.Icon className="h-5 w-5 text-primary" aria-hidden />
                <p className="text-xs font-semibold uppercase tracking-widest text-arc-subtext">{h.title}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-4">
          <Badge>{t('platform.benefits')}</Badge>
          <ul className="mt-5 space-y-3.5">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex gap-3 text-body">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-3">
          <Badge>{t('platform.howItWorks')}</Badge>
          <div className="mt-5 space-y-5">
            {howItWorks.map((step, idx) => (
              <div key={step.title} className="relative flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary shadow-soft">
                    <step.Icon className="h-5 w-5" aria-hidden />
                  </span>
                  {idx !== howItWorks.length - 1 ? (
                    <span className="mt-2 h-full w-px bg-gradient-to-b from-primary/35 to-transparent" aria-hidden />
                  ) : null}
                </div>
                <div className="pt-1">
                  <h3 className="text-base font-semibold tracking-tight text-arc-text">{step.title}</h3>
                  <p className="text-small mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </SectionContainer>
  )
}

export default PlatformPage

import { Badge, Card, PageHeader, SectionContainer } from '../shared/ui'
import { useTranslation } from 'react-i18next'
import Seo from '../shared/components/Seo'

function PlatformPage() {
  const { t } = useTranslation()
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
    },
    {
      title: t('platform.step2Title'),
      description: t('platform.step2Description'),
    },
    {
      title: t('platform.step3Title'),
      description: t('platform.step3Description'),
    },
  ]

  return (
    <SectionContainer>
      <Seo title={t('nav.platform')} description={t('platform.description')} />
      <PageHeader
        eyebrow={t('platform.eyebrow')}
        title={t('platform.title')}
        description={t('platform.description')}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <Badge>{t('platform.features')}</Badge>
          <ul className="mt-4 space-y-3">
            {features.map((feature) => (
              <li key={feature} className="text-body">
                {feature}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-1">
          <Badge>{t('platform.benefits')}</Badge>
          <ul className="mt-4 space-y-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="text-body">
                {benefit}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-1">
          <Badge>{t('platform.howItWorks')}</Badge>
          <div className="mt-4 space-y-4">
            {howItWorks.map((step) => (
              <div key={step.title}>
                <h3 className="text-base font-semibold text-arc-text">{step.title}</h3>
                <p className="text-small mt-1">{step.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </SectionContainer>
  )
}

export default PlatformPage

import { Badge, Card, PageHeader, SectionContainer } from '../shared/ui'
import { useTranslation } from 'react-i18next'

function ServicesPage() {
  const { t } = useTranslation()
  const services = [
    {
      title: t('services.service1Title'),
      description: t('services.service1Description'),
      tag: t('services.railway'),
    },
    {
      title: t('services.service2Title'),
      description: t('services.service2Description'),
      tag: t('services.railway'),
    },
    {
      title: t('services.service3Title'),
      description: t('services.service3Description'),
      tag: t('services.logistics'),
    },
    {
      title: t('services.service4Title'),
      description: t('services.service4Description'),
      tag: t('services.logistics'),
    },
    {
      title: t('services.service5Title'),
      description: t('services.service5Description'),
      tag: t('services.partnerships'),
    },
    {
      title: t('services.service6Title'),
      description: t('services.service6Description'),
      tag: t('services.partnerships'),
    },
  ]

  return (
    <SectionContainer>
      <PageHeader
        eyebrow={t('services.eyebrow')}
        title={t('services.title')}
        description={t('services.description')}
      />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <Card key={service.title}>
            <Badge>{service.tag}</Badge>
            <h3 className="mt-4 text-xl font-semibold text-arc-text">{service.title}</h3>
            <p className="text-body mt-3">{service.description}</p>
          </Card>
        ))}
      </div>
    </SectionContainer>
  )
}

export default ServicesPage

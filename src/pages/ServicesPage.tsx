import { Badge, Card, PageHeader, SectionContainer } from '../shared/ui'
import { useTranslation } from 'react-i18next'
import Seo from '../shared/components/Seo'
import { ArrowRight, Boxes, Handshake, PackageSearch, ShieldCheck, Train } from 'lucide-react'

function ServicesPage() {
  const { t } = useTranslation()
  const services = [
    {
      title: t('services.service1Title'),
      description: t('services.service1Description'),
      tag: t('services.railway'),
      Icon: Train,
    },
    {
      title: t('services.service2Title'),
      description: t('services.service2Description'),
      tag: t('services.railway'),
      Icon: ShieldCheck,
    },
    {
      title: t('services.service3Title'),
      description: t('services.service3Description'),
      tag: t('services.logistics'),
      Icon: PackageSearch,
    },
    {
      title: t('services.service4Title'),
      description: t('services.service4Description'),
      tag: t('services.logistics'),
      Icon: Boxes,
    },
    {
      title: t('services.service5Title'),
      description: t('services.service5Description'),
      tag: t('services.partnerships'),
      Icon: Handshake,
    },
    {
      title: t('services.service6Title'),
      description: t('services.service6Description'),
      tag: t('services.partnerships'),
      Icon: ArrowRight,
    },
  ]

  return (
    <SectionContainer>
      <Seo title={t('nav.services')} description={t('services.description')} />
      <PageHeader
        eyebrow={t('services.eyebrow')}
        title={t('services.title')}
        description={t('services.description')}
      />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <Card key={service.title} className="hover:-translate-y-1.5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge>{service.tag}</Badge>
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-arc-text">{service.title}</h3>
              </div>
              <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary shadow-soft">
                <service.Icon className="h-5 w-5" aria-hidden />
              </span>
            </div>
            <p className="text-body mt-3">{service.description}</p>
          </Card>
        ))}
      </div>
    </SectionContainer>
  )
}

export default ServicesPage

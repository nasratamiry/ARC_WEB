import { Badge, Card, PageHeader, SectionContainer } from '../shared/ui'
import { useTranslation } from 'react-i18next'

function AboutPage() {
  const { t } = useTranslation()
  const coreValues = t('about.coreValues', { returnObjects: true }) as string[]
  const strategicObjectives = t('about.strategicObjectives', { returnObjects: true }) as string[]
  const focusAreas = t('about.focusAreas', { returnObjects: true }) as string[]
  const structureDepartments = t('about.structureDepartments', { returnObjects: true }) as string[]
  const collaborationItems = t('about.collaborationItems', { returnObjects: true }) as string[]
  const impactItems = t('about.impactItems', { returnObjects: true }) as string[]

  return (
    <SectionContainer>
      <PageHeader
        eyebrow={t('about.eyebrow')}
        title={t('about.title')}
        description={t('about.description')}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <Badge>{t('about.introTitle')}</Badge>
          <p className="text-body mt-4">{t('about.introDescription')}</p>
        </Card>
        <Card>
          <Badge>{t('about.visionTitle')}</Badge>
          <p className="text-body mt-4">{t('about.visionDescription')}</p>
        </Card>
        <Card>
          <Badge>{t('about.missionTitle')}</Badge>
          <p className="text-body mt-4">{t('about.missionDescription')}</p>
        </Card>
        <Card>
          <Badge>{t('about.coreValuesTitle')}</Badge>
          <ul className="mt-4 space-y-2">
            {coreValues.map((item) => (
              <li key={item} className="text-body">
                {item}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <Badge>{t('about.strategicTitle')}</Badge>
          <ul className="mt-4 space-y-2">
            {strategicObjectives.map((item) => (
              <li key={item} className="text-body">
                {item}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <Badge>{t('about.focusTitle')}</Badge>
          <ul className="mt-4 space-y-2">
            {focusAreas.map((item) => (
              <li key={item} className="text-body">
                {item}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <Badge>{t('about.structureTitle')}</Badge>
          <ul className="mt-4 space-y-2">
            {structureDepartments.map((item) => (
              <li key={item} className="text-body">
                {item}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <Badge>{t('about.collaborationTitle')}</Badge>
          <ul className="mt-4 space-y-2">
            {collaborationItems.map((item) => (
              <li key={item} className="text-body">
                {item}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="lg:col-span-2">
          <Badge>{t('about.impactTitle')}</Badge>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {impactItems.map((item) => (
              <li key={item} className="text-body">
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </SectionContainer>
  )
}

export default AboutPage

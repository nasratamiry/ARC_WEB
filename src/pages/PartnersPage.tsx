import { usePartners } from '../hooks'
import { useTranslation } from 'react-i18next'
import { Button, Card, PageHeader, SectionContainer } from '../shared/ui'

function PartnersPage() {
  const { t } = useTranslation()
  const { data, loading, error, refetch } = usePartners()

  return (
    <SectionContainer>
      <PageHeader
        eyebrow={t('partners.eyebrow')}
        title={t('partners.title')}
        description={t('partners.description')}
      />

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={`partner-loading-${index}`} className="animate-pulse">
              <div className="h-20 w-40 rounded bg-arc-muted" />
              <div className="mt-5 h-6 w-3/4 rounded bg-arc-muted" />
              <div className="mt-3 h-4 w-full rounded bg-arc-muted" />
              <div className="mt-2 h-4 w-5/6 rounded bg-arc-muted" />
              <div className="mt-5 h-10 w-32 rounded bg-arc-muted" />
            </Card>
          ))}
        </div>
      ) : null}

      {error && !loading ? (
        <Card>
          <p className="text-body text-red-600">{error}</p>
          <div className="mt-4">
            <Button variant="outline" onClick={() => void refetch()}>
              {t('partners.retry')}
            </Button>
          </div>
        </Card>
      ) : null}

      {!loading && !error ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((partner) => (
            <Card key={`${partner.name}-${partner.order}`} className="flex h-full flex-col">
              <div className="flex h-20 items-center">
                <img src={partner.logo} alt={partner.name} className="max-h-16 w-auto max-w-[11rem] object-contain" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-arc-text">{partner.name}</h3>
              <p className="text-body mt-3 flex-1">{partner.description}</p>
              <div className="mt-6">
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-arc-text transition-colors hover:bg-primary/10"
                >
                  {t('partners.visitWebsite')}
                </a>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </SectionContainer>
  )
}

export default PartnersPage

import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocalizedPath, useNews } from '../hooks'
import Seo from '../shared/components/Seo'
import { Badge, Button, Card, PageHeader, SectionContainer } from '../shared/ui'
import { formatGregorianDate } from '../shared/utils/dateTime'

function NewsPage() {
  const { t, i18n } = useTranslation()
  const { withLang } = useLocalizedPath()
  const [searchParams, setSearchParams] = useSearchParams()
  const pageParam = Number(searchParams.get('page') ?? '1')
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1

  const { data, loading, error } = useNews({ page: currentPage })

  const handlePageChange = (page: number) => {
    const next = Math.max(1, page)
    setSearchParams({ page: String(next) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const hasNext = Boolean(data?.next)
  const hasPrevious = Boolean(data?.previous)

  const formatDate = (value: string) => formatGregorianDate(value, i18n.language, 'short')

  return (
    <SectionContainer>
      <Seo title={t('nav.news')} description={t('news.description')} />
      <PageHeader
        eyebrow={t('news.eyebrow')}
        title={t('news.title')}
        description={t('news.description')}
      />

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={`loading-${index}`} className="animate-pulse">
              <div className="h-44 rounded-xl bg-arc-muted" />
              <div className="mt-4 h-4 w-24 rounded bg-arc-muted" />
              <div className="mt-3 h-6 w-5/6 rounded bg-arc-muted" />
              <div className="mt-3 h-4 w-full rounded bg-arc-muted" />
              <div className="mt-2 h-4 w-2/3 rounded bg-arc-muted" />
            </Card>
          ))}
        </div>
      ) : null}

      {error && !loading ? (
        <Card>
          <p className="text-body text-red-600">{error}</p>
        </Card>
      ) : null}

      {!loading && !error ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data?.results.map((item) => (
              <Link key={item.slug} to={withLang(`/news/${item.slug}`)} className="group block">
                <Card className="h-full overflow-hidden p-0 transition-shadow group-hover:shadow-soft">
                  <div className="h-48 bg-arc-muted">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-6">
                    <Badge>{formatDate(item.created_at)}</Badge>
                    <h2 className="mt-4 text-xl font-semibold text-arc-text transition-colors group-hover:text-primary-dark">
                      {item.title}
                    </h2>
                    <p className="text-body mt-3 line-clamp-3">{item.excerpt}</p>
                    <span className="mt-5 inline-flex text-sm font-semibold text-primary-dark transition-colors group-hover:text-arc-text">
                      {t('news.readMore')}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center gap-3">
            <Button variant="secondary" onClick={() => handlePageChange(currentPage - 1)} disabled={!hasPrevious}>
              {t('news.previous')}
            </Button>
            <span className="text-small rounded-xl border border-arc-border bg-white px-4 py-2">
              {t('news.page')} {currentPage}
            </span>
            <Button variant="secondary" onClick={() => handlePageChange(currentPage + 1)} disabled={!hasNext}>
              {t('news.next')}
            </Button>
          </div>
        </>
      ) : null}
    </SectionContainer>
  )
}

export default NewsPage

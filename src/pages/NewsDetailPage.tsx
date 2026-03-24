import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useNewsDetail } from '../hooks'
import { Badge, Button, Card, PageHeader, SectionContainer } from '../shared/ui'

function NewsDetailPage() {
  const { t, i18n } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
  const { data, loading, error } = useNewsDetail(slug, { enabled: Boolean(slug) })

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  return (
    <SectionContainer>
      <div className="mb-6">
        <Link to="/news">
          <Button variant="outline">{t('news.backToNews')}</Button>
        </Link>
      </div>

      {loading ? (
        <Card className="animate-pulse">
          <div className="h-64 rounded-xl bg-arc-muted" />
          <div className="mt-6 h-5 w-32 rounded bg-arc-muted" />
          <div className="mt-4 h-10 w-4/5 rounded bg-arc-muted" />
          <div className="mt-4 h-4 w-full rounded bg-arc-muted" />
          <div className="mt-2 h-4 w-full rounded bg-arc-muted" />
          <div className="mt-2 h-4 w-2/3 rounded bg-arc-muted" />
        </Card>
      ) : null}

      {error && !loading ? (
        <Card>
          <p className="text-body text-red-600">{error}</p>
        </Card>
      ) : null}

      {!loading && !error && data ? (
        <>
          <PageHeader eyebrow={t('news.detailEyebrow')} title={data.title} description={formatDate(data.created_at)} />

          <Card className="overflow-hidden p-0">
            <div className="h-72 bg-arc-muted sm:h-96">
              <img src={data.image} alt={data.title} className="h-full w-full object-cover" />
            </div>
            <article className="p-6 sm:p-8">
              <p className="text-body whitespace-pre-line">{data.content}</p>

              {data.tags.length ? (
                <div className="mt-8 flex flex-wrap gap-2">
                  {data.tags.map((tag) => (
                    <Badge key={tag.slug}>{tag.name}</Badge>
                  ))}
                </div>
              ) : null}
            </article>
          </Card>
        </>
      ) : null}
    </SectionContainer>
  )
}

export default NewsDetailPage

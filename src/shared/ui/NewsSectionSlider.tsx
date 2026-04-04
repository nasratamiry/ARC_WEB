import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { NewsItem } from '../../types/api'
import Card from './Card'

type NewsSectionSliderProps = {
  items: NewsItem[]
  buildPath: (slug: string) => string
}

function NewsSectionSlider({ items, buildPath }: NewsSectionSliderProps) {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (items.length <= 1) return undefined
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length)
    }, 6500)
    return () => window.clearInterval(id)
  }, [items.length])

  if (items.length === 0) return null

  return (
    <div className="relative min-w-0">
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {items.map((item) => (
            <div key={item.slug} className="w-full shrink-0 px-1 sm:px-1.5">
              <Link to={buildPath(item.slug)} className="group block">
                <Card className="h-full overflow-hidden p-0 sm:flex sm:min-h-[280px]">
                  <div className="relative h-52 shrink-0 overflow-hidden bg-arc-muted sm:h-auto sm:w-[42%]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-80 sm:bg-gradient-to-r" />
                  </div>
                  <div className="flex flex-1 flex-col justify-center p-6 sm:p-8">
                    <h3 className="text-xl font-semibold text-arc-text transition-colors group-hover:text-primary-dark sm:text-2xl">
                      {item.title}
                    </h3>
                    <p className="text-body mt-3 line-clamp-4 sm:line-clamp-5">{item.excerpt}</p>
                    <span className="mt-5 inline-flex items-center text-sm font-semibold text-primary">
                      <span className="border-b border-primary/40 transition-colors group-hover:border-primary">
                        {t('news.readMore')}
                      </span>
                    </span>
                  </div>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {items.length > 1 ? (
        <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label="News slides">
          {items.map((item, i) => (
            <button
              key={`news-dot-${item.slug}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`News ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? 'w-8 bg-primary shadow-glow' : 'w-2 bg-arc-border hover:bg-primary/40'
              }`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default NewsSectionSlider

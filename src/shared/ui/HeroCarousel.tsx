import { useCallback, useEffect, useState } from 'react'
import Button from './Button'

export type HeroSlide = {
  id: string
  eyebrow: string
  title: string
  subtitle: string
  ctaLabel: string
  ctaTo: string
  image: string
  overlay?: 'dark' | 'medium' | 'light'
}

const INTERVAL_MS = 7000

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  const isLeft = direction === 'left'
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={isLeft ? 'M15 6L9 12L15 18' : 'M9 6L15 12L9 18'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function overlayClass(tone: HeroSlide['overlay']): string {
  if (tone === 'light') {
    return 'bg-gradient-to-t from-slate-950/78 via-slate-950/40 to-slate-900/22'
  }
  if (tone === 'medium') {
    return 'bg-gradient-to-t from-slate-950/70 via-slate-950/30 to-slate-900/18'
  }
  return 'bg-gradient-to-t from-slate-950/82 via-slate-950/42 to-slate-900/22'
}

type HeroCarouselProps = {
  slides: HeroSlide[]
}

function HeroCarousel({ slides }: HeroCarouselProps) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const goTo = useCallback(
    (index: number) => {
      setActive((index + slides.length) % slides.length)
    },
    [slides.length],
  )

  useEffect(() => {
    if (slides.length <= 1 || paused) return undefined
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length)
    }, INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [slides.length, paused])

  return (
    <section
      className="relative -mt-16 min-h-screen w-full overflow-hidden pt-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Hero"
    >
      {slides.map((slide, index) => {
        const isActive = index === active
        const base = slide.image.replace(/\.(png|jpg|jpeg|webp|avif)$/i, '')
        const avif = `${base}.avif`
        const webp = `${base}.webp`
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isActive ? 'z-[1] opacity-100' : 'z-0 opacity-0'
            } ${isActive ? 'pointer-events-auto' : 'pointer-events-none'}`}
            aria-hidden={!isActive}
          >
            <div
              className={`absolute inset-0 transition-transform duration-[900ms] ease-out ${
                isActive ? 'scale-100' : 'scale-[1.06]'
              }`}
              aria-hidden
            >
              <picture>
                <source srcSet={avif} type="image/avif" />
                <source srcSet={webp} type="image/webp" />
                <img
                  src={slide.image}
                  alt=""
                  className="h-full w-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  decoding="async"
                />
              </picture>
            </div>
            <div className={`absolute inset-0 ${overlayClass(slide.overlay)}`} aria-hidden />
            <div className="relative z-[2] mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-layout flex-col justify-center px-4 pb-24 pt-28 sm:px-6 lg:px-8">
              <div
                className={`max-w-3xl rounded-2xl bg-slate-950/28 p-5 backdrop-blur-[1.5px] sm:p-7 lg:p-8 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200 sm:text-base">{slide.eyebrow}</p>
                <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.08]">
                  {slide.title}
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-100 sm:text-xl sm:leading-8">{slide.subtitle}</p>
                <div className="mt-10">
                  <Button to={slide.ctaTo} variant="primary">
                    {slide.ctaLabel}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      <div
        className="absolute bottom-10 left-0 right-0 z-[3] flex justify-center sm:bottom-12"
        role="tablist"
        aria-label="Slides"
      >
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-gradient-to-b from-white/10 to-white/0 bg-slate-950/30 px-2.5 py-2.5 shadow-soft backdrop-blur-md">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => goTo(active - 1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/85 transition hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <ArrowIcon direction="left" />
          </button>

          <div className="flex items-center gap-2 px-1" aria-label="Slide selector">
            {slides.map((slide, index) => {
              const isActive = index === active
              return (
                <button
                  key={`seg-${slide.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Slide ${index + 1}`}
                  onClick={() => goTo(index)}
                  className={`relative h-2 w-11 overflow-hidden rounded-full transition ${
                    isActive ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {isActive ? (
                    <span
                      key={`progress-${active}`}
                      className="absolute inset-y-0 left-0 w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-primary to-cyan-200 shadow-glow animate-hero-progress"
                      style={{ animationDuration: `${INTERVAL_MS}ms` }}
                      aria-hidden
                    />
                  ) : null}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            aria-label="Next slide"
            onClick={() => goTo(active + 1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/85 transition hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <ArrowIcon direction="right" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default HeroCarousel

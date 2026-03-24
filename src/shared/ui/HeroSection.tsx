import Button from './Button'
import SectionContainer from './SectionContainer'

type HeroSectionProps = {
  eyebrowLabel?: string
  title: string
  subtitle: string
  ctaLabel: string
  onCtaClick?: () => void
  backgroundImageBaseUrl?: string
}

function HeroSection({ eyebrowLabel, title, subtitle, ctaLabel, onCtaClick, backgroundImageBaseUrl }: HeroSectionProps) {
  const backgroundStyle = backgroundImageBaseUrl
    ? {
        backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.66) 44%, rgba(255,255,255,0.38) 72%, rgba(255,255,255,0.24) 100%), image-set(url(${backgroundImageBaseUrl}.avif) type("image/avif"), url(${backgroundImageBaseUrl}.webp) type("image/webp"), url(${backgroundImageBaseUrl}.png) type("image/png"))`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }
    : undefined

  return (
    <SectionContainer className="pb-8 pt-12 lg:pt-20">
      <div
        className="relative overflow-hidden rounded-2xl border border-arc-border bg-arc-surface px-6 py-12 shadow-soft sm:px-10 lg:px-16"
        style={backgroundStyle}
      >
        <p className="text-small font-semibold uppercase tracking-widest text-primary-dark">
          {eyebrowLabel ?? 'Afghanistan Railway Consortium'}
        </p>
        <h1 className="text-heading-xl mt-4 max-w-4xl">{title}</h1>
        <p className="text-body mt-5 max-w-2xl">{subtitle}</p>
        <div className="mt-8">
          <Button onClick={onCtaClick}>{ctaLabel}</Button>
        </div>
      </div>
    </SectionContainer>
  )
}

export default HeroSection

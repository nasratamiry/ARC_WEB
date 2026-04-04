import type { Partner } from '../../types/api'

type PartnersMarqueeProps = {
  partners: Partner[]
}

function PartnersMarquee({ partners }: PartnersMarqueeProps) {
  if (partners.length === 0) return null

  const loop = [...partners, ...partners]

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-white/80 p-1 shadow-lift backdrop-blur-md">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-16 bg-gradient-to-r from-white to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-16 bg-gradient-to-l from-white to-transparent"
        aria-hidden
      />
      <div className="flex animate-partners-marquee gap-4 py-4 pl-4">
        {loop.map((partner, index) => (
          <a
            key={`${partner.name}-${index}`}
            href={partner.website}
            target="_blank"
            rel="noreferrer"
            className="flex min-w-[min(220px,calc(100vw-3rem))] max-w-[min(220px,calc(100vw-3rem))] shrink-0 items-center gap-3 rounded-2xl border border-arc-border/90 bg-white/95 px-4 py-3 shadow-soft transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lift sm:px-5 sm:py-3.5"
          >
            <img
              src={partner.logo}
              alt={partner.name}
              className="h-10 w-auto max-w-[90px] object-contain"
              loading="lazy"
            />
            <span className="line-clamp-1 text-sm font-semibold text-arc-text">{partner.name}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

export default PartnersMarquee

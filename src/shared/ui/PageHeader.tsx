import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  description?: string
  eyebrow?: string
  actions?: ReactNode
  /** Use h2 when the page already has a primary h1 (e.g. hero). */
  titleAs?: 'h1' | 'h2'
}

function PageHeader({ title, description, eyebrow, actions, titleAs = 'h1' }: PageHeaderProps) {
  const TitleTag = titleAs
  return (
    <header className="mb-12 flex flex-col gap-6 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        ) : null}
        <TitleTag className="mt-3 text-3xl font-bold tracking-tight text-arc-text sm:text-4xl lg:text-5xl">{title}</TitleTag>
        {description ? <p className="text-body mt-4 max-w-2xl text-base sm:text-lg">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  )
}

export default PageHeader

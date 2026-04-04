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
    <header className="mb-8 flex flex-col gap-4 sm:mb-10 sm:gap-5 md:mb-12 md:flex-row md:items-end md:justify-between md:gap-8">
      <div className="min-w-0 max-w-3xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:text-sm">{eyebrow}</p>
        ) : null}
        <TitleTag className="mt-2 text-2xl font-bold tracking-tight text-arc-text sm:mt-3 sm:text-3xl lg:text-4xl xl:text-5xl">
          {title}
        </TitleTag>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-arc-subtext sm:mt-4 sm:text-base sm:leading-7 lg:text-lg lg:leading-8">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">{actions}</div>
      ) : null}
    </header>
  )
}

export default PageHeader

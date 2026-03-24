import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  description?: string
  eyebrow?: string
  actions?: ReactNode
}

function PageHeader({ title, description, eyebrow, actions }: PageHeaderProps) {
  return (
    <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-small font-semibold uppercase tracking-widest text-primary-dark">{eyebrow}</p> : null}
        <h1 className="text-heading-lg mt-2">{title}</h1>
        {description ? <p className="text-body mt-3 max-w-3xl">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </header>
  )
}

export default PageHeader

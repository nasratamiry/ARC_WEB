import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = {
  children: ReactNode
} & HTMLAttributes<HTMLDivElement>

function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`group relative min-w-0 overflow-hidden rounded-2xl border border-arc-border/70 bg-arc-surface/90 p-4 shadow-card backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift hover:ring-1 hover:ring-primary/20 sm:p-5 md:p-6 ${className}`.trim()}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      >
        <div className="absolute -top-24 left-1/3 h-48 w-48 rounded-full bg-primary/18 blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 h-48 w-48 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      </div>
      {children}
    </div>
  )
}

export default Card

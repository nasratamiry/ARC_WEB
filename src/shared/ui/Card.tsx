import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = {
  children: ReactNode
} & HTMLAttributes<HTMLDivElement>

function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`group rounded-2xl border border-arc-border/80 bg-arc-surface/90 p-6 shadow-card backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/35 hover:shadow-lift ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card

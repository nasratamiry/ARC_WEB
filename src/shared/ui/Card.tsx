import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = {
  children: ReactNode
} & HTMLAttributes<HTMLDivElement>

function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-arc-border bg-arc-surface p-6 shadow-card ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card

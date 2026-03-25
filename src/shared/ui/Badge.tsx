import type { HTMLAttributes, ReactNode } from 'react'

type BadgeProps = {
  children: ReactNode
} & HTMLAttributes<HTMLSpanElement>

function Badge({ children, className = '', ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-xl border border-primary/50 bg-primary/12 px-3 py-1 text-xs font-semibold tracking-wide text-primary-dark ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge

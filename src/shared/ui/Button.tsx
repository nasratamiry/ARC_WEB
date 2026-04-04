import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

export type ButtonVariant = 'primary' | 'secondary'
export type ButtonSize = 'sm' | 'md'

type ButtonProps = {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  to?: string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>

const baseClass =
  'inline-flex min-h-11 select-none items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:min-h-10'

const sizeClass: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm sm:text-base',
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-slate-950 shadow-soft ring-1 ring-white/10 hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-primary-light hover:shadow-glow active:translate-y-0 active:scale-[0.995]',
  secondary:
    'border border-primary/35 bg-white text-arc-text shadow-soft hover:-translate-y-0.5 hover:scale-[1.02] hover:border-primary/70 hover:bg-primary/10 hover:text-arc-text hover:shadow-glow active:translate-y-0 active:scale-[0.995]',
}

function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  to,
  type = 'button',
  ...rest
}: ButtonProps) {
  const linkLayout = to ? 'w-full sm:w-auto' : ''
  const classes = `${baseClass} ${linkLayout} ${sizeClass[size]} ${variantClass[variant]} ${className}`.trim()

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  )
}

export default Button

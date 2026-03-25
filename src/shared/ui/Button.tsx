import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

export type ButtonVariant = 'primary' | 'secondary'

type ButtonProps = {
  children: ReactNode
  variant?: ButtonVariant
  className?: string
  to?: string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>

const baseClass =
  'inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none'

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-soft hover:-translate-y-0.5 hover:bg-primary-deeper hover:shadow-lift active:translate-y-0',
  secondary:
    'border-2 border-primary bg-white text-primary-dark hover:-translate-y-0.5 hover:bg-primary hover:text-white hover:shadow-lift active:translate-y-0',
}

function Button({ children, className = '', variant = 'primary', to, type = 'button', ...rest }: ButtonProps) {
  const classes = `${baseClass} ${variantClass[variant]} ${className}`.trim()

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

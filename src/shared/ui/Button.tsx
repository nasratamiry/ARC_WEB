import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'outline'

type ButtonProps = {
  children: ReactNode
  variant?: ButtonVariant
} & ButtonHTMLAttributes<HTMLButtonElement>

function Button({ children, className = '', variant = 'primary', ...props }: ButtonProps) {
  const baseClass =
    'inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'

  const variantClass =
    variant === 'outline'
      ? 'border border-primary text-arc-text hover:bg-primary/10'
      : 'bg-primary text-arc-text shadow-soft hover:bg-primary-dark'

  return (
    <button className={`${baseClass} ${variantClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}

export default Button

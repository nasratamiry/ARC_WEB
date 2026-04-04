import type { HTMLAttributes, ReactNode } from 'react'
import { useInView } from '../../hooks'

export type SectionVariant = 'default' | 'muted' | 'tint'

type SectionContainerProps = {
  children: ReactNode
  variant?: SectionVariant
  animate?: boolean
} & HTMLAttributes<HTMLElement>

function SectionContainer({
  children,
  className = '',
  variant = 'default',
  animate = true,
  ...props
}: SectionContainerProps) {
  const { ref, isInView } = useInView<HTMLElement>()

  const variantClass =
    variant === 'muted'
      ? 'arc-section-muted'
      : variant === 'tint'
        ? 'bg-gradient-to-b from-primary/[0.08] via-primary/[0.03] to-white'
        : ''

  const motionClass = animate
    ? `motion-safe:transition-all motion-safe:duration-600 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`
    : ''

  return (
    <section
      ref={ref}
      className={`mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-section ${variantClass} ${motionClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </section>
  )
}

export default SectionContainer

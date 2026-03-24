import type { HTMLAttributes, ReactNode } from 'react'

type SectionContainerProps = {
  children: ReactNode
} & HTMLAttributes<HTMLElement>

function SectionContainer({ children, className = '', ...props }: SectionContainerProps) {
  return (
    <section className={`mx-auto w-full max-w-layout px-4 py-section sm:px-6 lg:px-8 ${className}`.trim()} {...props}>
      {children}
    </section>
  )
}

export default SectionContainer

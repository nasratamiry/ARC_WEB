import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

type Props = {
  eyebrow?: string
  title: string
  description?: string
  children: ReactNode
}

function AuthPageShell({ eyebrow, title, description, children }: Props) {
  return (
    <div className="relative min-h-[calc(100dvh-4rem)] w-full px-4 py-10 sm:py-14">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,226,255,0.35),transparent_55%),radial-gradient(circle_at_bottom,rgba(0,226,255,0.18),transparent_52%),linear-gradient(180deg,#030b14_0%,#ffffff_120%)]"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto w-full max-w-lg"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="rounded-2xl border border-white/30 bg-white/90 p-6 shadow-soft backdrop-blur-md sm:p-8"
        >
          <div className="text-center">
            {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p> : null}
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-arc-text sm:text-4xl">{title}</h1>
            {description ? <p className="mt-3 text-body mx-auto max-w-md text-arc-subtext">{description}</p> : null}
          </div>

          <div className="mt-8">{children}</div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default AuthPageShell


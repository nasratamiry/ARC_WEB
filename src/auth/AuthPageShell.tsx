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
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#061321_0%,#103042_36%,#3f7382_62%,#7ea8b2_80%,#dce8ec_100%),repeating-linear-gradient(115deg,rgba(0,226,255,0.11)_0_2px,transparent_2px_34px),repeating-linear-gradient(165deg,rgba(0,226,255,0.07)_0_1px,transparent_1px_24px)]"
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
          className="rounded-3xl border border-white/70 bg-white/96 p-6 shadow-[0_24px_70px_-34px_rgba(2,6,23,0.55)] backdrop-blur-md sm:p-10"
        >
          <div className="text-left">
            {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{eyebrow}</p> : null}
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-arc-text sm:text-[2.55rem]">
              {title}
            </h1>
            {description ? <p className="mt-3 max-w-md text-base font-medium leading-7 text-arc-text/90">{description}</p> : null}
          </div>

          <div className="mt-8">{children}</div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default AuthPageShell


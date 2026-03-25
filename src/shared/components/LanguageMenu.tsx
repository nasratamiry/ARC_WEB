import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocalizedPath } from '../../hooks'

const languages = [
  { code: 'en', label: 'English' },
  { code: 'fa', label: 'دری' },
  { code: 'ps', label: 'پښتو' },
  { code: 'uz', label: 'Oʻzbekcha' },
] as const

type Props = {
  variant?: 'light' | 'dark' | 'hero'
  className?: string
}

function ChevronDown({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LanguageMenu({ variant = 'light', className = '' }: Props) {
  const { i18n, t } = useTranslation()
  const { activeLanguage } = useLocalizedPath()
  const [open, setOpen] = useState(false)
  const buttonId = useId()
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return undefined
    const onDown = (event: MouseEvent) => {
      if (!rootRef.current) return
      if (event.target instanceof Node && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [open])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!open) return
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const active = useMemo(() => languages.find((l) => l.code === activeLanguage) ?? languages[0], [activeLanguage])

  const shell =
    variant === 'dark'
      ? 'border-white/15 bg-white/5 text-white hover:bg-white/10'
      : variant === 'hero'
        ? 'border-white/25 bg-slate-950/35 text-white hover:bg-slate-950/45'
        : 'border-arc-border bg-white text-arc-text hover:bg-arc-muted'

  const menuShell =
    variant === 'dark' || variant === 'hero'
      ? 'border-white/15 bg-slate-950/80 text-white backdrop-blur-md'
      : 'border-arc-border bg-white text-arc-text'

  return (
    <div ref={rootRef} className={`relative ${className}`.trim()}>
      <button
        id={buttonId}
        type="button"
        className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-primary/35 ${shell}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{active.label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : 'rotate-0'}`} />
      </button>

      <div
        className={`absolute right-0 top-[calc(100%+0.5rem)] z-[60] w-44 origin-top-right transition ${
          open ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-[0.98] opacity-0'
        }`}
      >
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={buttonId}
          className={`overflow-hidden rounded-2xl border shadow-soft ${menuShell}`}
        >
          <p className={`px-4 pb-2 pt-3 text-xs font-semibold uppercase tracking-[0.22em] ${variant === 'dark' || variant === 'hero' ? 'text-white/70' : 'text-arc-subtext'}`}>
            {t('nav.language')}
          </p>
          <div className="pb-2">
            {languages.map((lang) => {
              const selected = lang.code === activeLanguage
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition ${
                    selected
                      ? variant === 'dark' || variant === 'hero'
                        ? 'bg-white/10 text-white'
                        : 'bg-primary/10 text-arc-text'
                      : variant === 'dark' || variant === 'hero'
                        ? 'text-white/90 hover:bg-white/10'
                        : 'text-arc-text hover:bg-arc-muted'
                  }`}
                  onClick={() => {
                    const nextLanguage = lang.code
                    const pathWithoutLang = window.location.pathname.replace(/^\/(en|fa|ps|uz)/, '') || '/'
                    window.location.pathname = `/${nextLanguage}${pathWithoutLang}`
                    void i18n.changeLanguage(nextLanguage)
                    setOpen(false)
                  }}
                >
                  <span>{lang.label}</span>
                  {selected ? <span className={variant === 'dark' || variant === 'hero' ? 'text-primary' : 'text-primary-dark'}>✓</span> : null}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LanguageMenu


import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLocalizedPath } from '../../hooks'

/** Brand: primary #00e2ff — use with dark foreground on filled surfaces for WCAG contrast. */
export const RES_PRIMARY = '#00e2ff'
export const RES_TEXT = '#1a1a1a'
export const RES_TEXT_MUTED = '#666666'
export const RES_BORDER = '#e5e7eb'

/**
 * Same horizontal bounds as `ReservationLayout` / reservation cards (max-width + padding).
 * Keep in sync with `ReservationLayout` shell.
 */
export const reservationColumnClass =
  'mx-auto w-full max-w-xl px-4 sm:max-w-2xl sm:px-5 lg:max-w-3xl lg:px-6'

type Props = {
  title: string
  backTo?: string
  rightSlot?: React.ReactNode
}

/**
 * Frosted title bar — fixed below main Navbar; width matches reservation content column.
 */
export function ReservationGradientHeader({ title, backTo, rightSlot }: Props) {
  const navigate = useNavigate()
  const { withLang } = useLocalizedPath()

  const barSurface =
    'flex items-center gap-1 rounded-b-xl border-b-2 border-[#00e2ff]/55 bg-gradient-to-r from-white/65 via-[#e6fbff]/90 to-white/55 py-3 shadow-[0_12px_36px_-14px_rgba(0,226,255,0.45)] backdrop-blur-xl backdrop-saturate-150 ring-1 ring-white/70 sm:gap-2 sm:py-3.5'

  return (
    <>
      <div className="fixed top-16 left-0 right-0 z-[45]">
        <div className={reservationColumnClass}>
          <header className={barSurface}>
            <button
              type="button"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#0a2540] transition-colors duration-200 hover:bg-[#00e2ff]/25 active:bg-[#00e2ff]/35 sm:h-10 sm:w-10 sm:rounded-xl"
              aria-label="Back"
              onClick={() => (backTo ? navigate(withLang(backTo)) : navigate(-1))}
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <h1 className="min-w-0 flex-1 text-center text-sm font-bold leading-snug tracking-tight text-[#0a2540] sm:text-base md:text-lg">
              {title}
            </h1>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center text-[#0a2540] sm:h-10 sm:w-10">
              {rightSlot ?? <span className="inline-block w-9 sm:w-10" />}
            </div>
          </header>
        </div>
      </div>
      {/* Reserve vertical space so page content clears the fixed bar */}
      <div className="mb-4 h-[4.25rem] shrink-0 sm:h-[4.5rem]" aria-hidden />
    </>
  )
}

/** Premium card: white surface, neutral border, generous padding. */
export function reservationCardClass() {
  return [
    'rounded-xl border bg-white p-4',
    'border-[#e5e7eb] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)]',
    'transition-all duration-300 ease-out',
    'sm:p-5 md:rounded-2xl md:p-6',
  ].join(' ')
}

/**
 * Append to `reservationCardClass()` on links / clickable cards — border, glow, and tint at #00e2ff.
 */
export const reservationCardInteractiveClass =
  'cursor-pointer hover:border-[#00e2ff] hover:bg-gradient-to-br hover:from-white hover:to-[#ecfeff]/85 hover:shadow-[0_16px_48px_-16px_rgba(0,226,255,0.4)] hover:ring-1 hover:ring-[#00e2ff]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e2ff]/45 active:scale-[0.998]'

/**
 * Nested list rows (payments, reservation detail installments) — lighter hover, same brand.
 */
export const reservationNestedRowHoverClass =
  'transition-all duration-200 ease-out hover:border-[#00e2ff]/70 hover:bg-[#ecfeff]/60 hover:shadow-[0_10px_34px_-12px_rgba(0,226,255,0.3)]'

/** Vertical rhythm between major blocks (pages use this on outer wrapper). */
export const reservationPageStackClass = 'flex flex-col gap-4 md:gap-5'

export const reservationTextPrimary = 'text-[#1a1a1a]'

export const reservationTextSecondary = 'text-[#666666]'

export const reservationHeadingClass = `font-bold ${reservationTextPrimary} text-base tracking-tight sm:text-lg md:text-xl`

export const reservationCardTitleClass = `font-bold ${reservationTextPrimary} text-sm sm:text-base`

export const reservationLabelClass = `mb-2 block text-sm font-semibold ${reservationTextPrimary}`

export const reservationPriceHighlightClass = `text-base font-bold ${reservationTextPrimary} sm:text-lg`

/** Inputs: white bg, neutral border, focus ring brand #00e2ff */
export const reservationFieldClass =
  'w-full rounded-xl border border-[#e5e7eb] bg-white py-2.5 pl-4 pr-4 text-sm font-medium text-[#1a1a1a] shadow-sm outline-none transition-[box-shadow,border-color,background-color] duration-200 placeholder:text-[#999999] hover:border-[#00e2ff]/55 hover:bg-[#fcfeff] focus:border-[#00e2ff] focus:ring-2 focus:ring-[#00e2ff]/30 sm:text-base md:py-3'

/**
 * Extra left padding when a leading icon sits in `absolute left-4` (w-5).
 * Overrides reservationFieldClass `pl-4` so text does not collide with the icon.
 */
export const reservationFieldLeadingIconPadClass = 'pl-[3.25rem] sm:pl-14'

export const reservationFieldDisabledClass =
  'cursor-not-allowed border-[#e5e7eb] bg-[#f5f5f5] text-[#888888] hover:border-[#e5e7eb] hover:bg-[#f5f5f5]'

/** Primary CTA: brand fill, dark label (readable on #00e2ff). */
export const reservationBtnPrimaryClass =
  'inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-xl bg-[#00e2ff] px-5 py-2.5 text-sm font-bold text-[#1a1a1a] shadow-md shadow-[#00e2ff]/25 outline-none transition-all duration-200 hover:brightness-[1.04] hover:shadow-[0_14px_40px_-12px_rgba(0,226,255,0.55)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none sm:min-h-[2.875rem] sm:px-6 sm:text-base md:px-7'

/** Secondary: outline brand — border #00e2ff; label uses darker cyan for small-text contrast. */
export const reservationBtnSecondaryClass =
  'inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-xl border-2 border-[#00e2ff] bg-white px-5 py-2.5 text-sm font-bold text-[#006c7a] outline-none transition-all duration-200 hover:border-[#00e2ff] hover:bg-[#ecfeff] hover:shadow-[0_10px_32px_-12px_rgba(0,226,255,0.38)] active:scale-[0.98] disabled:pointer-events-none disabled:border-[#cbd5e1] disabled:text-[#94a3b8] disabled:opacity-70'

export const reservationLinkClass =
  'font-semibold text-[#006c7a] underline decoration-[#00e2ff] decoration-2 underline-offset-2 transition-colors duration-200 hover:text-[#0a2540]'

/** Icon tiles: light brand wash, dark icon */
export const reservationIconBrandSoftClass =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e6fbff] text-[#0a2540] ring-1 ring-[#00e2ff]/35 sm:h-10 sm:w-10 sm:rounded-xl'

export const reservationIconNeutralClass =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0a2540] text-white shadow-md sm:h-10 sm:w-10 sm:rounded-xl'

export const reservationDividerClass = 'my-4 border-t border-[#e5e7eb]'

export const reservationTrackingBoxClass =
  'rounded-xl border border-[#e5e7eb] bg-[#fafafa] px-3 py-2.5 font-mono text-sm font-semibold text-[#1a1a1a]'

/**
 * Status badges — high contrast. Approved uses brand-tint ground + dark text (not white on #00e2ff).
 */
export function reservationStatusBadgeClass(status?: string) {
  const s = (status ?? '').toLowerCase()
  const base = 'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold'
  if (s.includes('reject') || s.includes('declin')) {
    return `${base} bg-red-100 text-red-900 ring-1 ring-red-200`
  }
  if (s.includes('pending') || s.includes('wait') || s.includes('draft')) {
    return `${base} bg-amber-100 text-amber-950 ring-1 ring-amber-300/80`
  }
  if (
    s.includes('complete') ||
    s.includes('deliver') ||
    s.includes('done') ||
    s.includes('fulfill') ||
    s.includes('closed')
  ) {
    return `${base} bg-emerald-100 text-emerald-950 ring-1 ring-emerald-200`
  }
  if (s.includes('approved') || s.includes('confirm')) {
    return `${base} bg-[#e6fbff] text-[#0a2540] ring-1 ring-[#00e2ff]`
  }
  if (s.includes('cancel')) {
    return `${base} bg-slate-200 text-slate-900 ring-1 ring-slate-300`
  }
  return `${base} bg-slate-100 text-slate-900 ring-1 ring-slate-200`
}
